import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { joinUrl } from '@nutai/prompt'
import { Icon } from '../src/components/Icon'
import { putSetting, setting } from '../src/data/repo'
import { loadCredential, saveCredential } from '../src/inference/credentials'
import { useTheme } from '../src/theme/ThemeProvider'
import { MIN_TAP_TARGET, radius, space, type } from '../src/theme/tokens'

/**
 * Any OpenAI-compatible endpoint: OpenRouter, NVIDIA NIM, Groq, a self-hosted
 * server. The photo goes to the base URL typed here and nowhere else.
 *
 * The model must accept images. The presets are starting points; model ids
 * change, so the field is free text rather than a catalogue.
 */

const PRESETS = [
  {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api',
    model: 'google/gemini-2.0-flash-001',
    keyUrl: 'https://openrouter.ai/keys',
  },
  {
    name: 'NVIDIA NIM',
    baseUrl: 'https://integrate.api.nvidia.com',
    model: 'meta/llama-3.2-90b-vision-instruct',
    keyUrl: 'https://build.nvidia.com/settings/api-keys',
  },
] as const

export default function CustomProvider() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const [baseUrl, setBaseUrl] = useState<string>(PRESETS[0].baseUrl)
  const [model, setModel] = useState<string>(PRESETS[0].model)
  const [key, setKey] = useState('')
  const [hasKey, setHasKey] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    void (async () => {
      const [b, m, c] = await Promise.all([setting('custom_base_url'), setting('provider_model'), loadCredential('custom')])
      if (b) setBaseUrl(b)
      if (b && m) setModel(m)
      setHasKey(Boolean(c))
    })()
  }, [])

  const base = baseUrl.trim()
  const keyValue = key.trim()
  const canSave = /^https:\/\//.test(base) && model.trim().length > 0 && (keyValue.length >= 8 || hasKey)

  async function save() {
    if (busy || !canSave) return
    setBusy(true)
    setResult(null)
    try {
      const stored = keyValue || (await loadCredential('custom'))?.value || ''
      // One text-only, one-token call: proves the key, base URL and model id
      // without sending a photo.
      const res = await fetch(joinUrl(base, '/v1/chat/completions'), {
        method: 'POST',
        headers: { authorization: `Bearer ${stored}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model: model.trim(), max_tokens: 1, messages: [{ role: 'user', content: 'ok' }] }),
      })
      if (!res.ok) {
        const body = (await res.text()).slice(0, 300)
        setResult({ ok: false, text: `HTTP ${res.status} — ${body}` })
        return
      }
      await saveCredential('custom', { kind: 'api_key', value: stored })
      await putSetting('custom_base_url', base)
      await putSetting('provider_model', model.trim())
      await putSetting('provider', 'custom')
      setHasKey(true)
      setKey('')
      setResult({ ok: true, text: 'Connected. Photo scans now use this provider.' })
    } catch {
      setResult({ ok: false, text: 'Could not reach that URL. Check the address and your connection.' })
    } finally {
      setBusy(false)
    }
  }

  const input = [styles.input, { color: theme.text, backgroundColor: theme.bgSunken, borderColor: theme.border }]

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={[styles.head, { paddingTop: insets.top + space.sm }]}>
        <Text style={[type.title, { color: theme.text }]}>Custom provider</Text>
        <Pressable onPress={() => router.back()} hitSlop={space.md}>
          <Icon name="close" size={22} color={theme.textMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View style={styles.chipRow}>
          {PRESETS.map((p) => (
            <Pressable
              key={p.name}
              onPress={() => {
                setBaseUrl(p.baseUrl)
                setModel(p.model)
                setResult(null)
              }}
              style={[styles.chip, base === p.baseUrl ? { backgroundColor: theme.accent } : { backgroundColor: theme.bgSunken }]}
            >
              <Text style={[type.label, { color: base === p.baseUrl ? theme.onAccent : theme.text }]}>{p.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[type.label, { color: theme.textMuted, marginTop: space.xl }]}>Base URL</Text>
        <TextInput value={baseUrl} onChangeText={setBaseUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" style={input} />

        <Text style={[type.label, { color: theme.textMuted, marginTop: space.lg }]}>Vision model id</Text>
        <TextInput value={model} onChangeText={setModel} autoCapitalize="none" autoCorrect={false} style={input} />

        <Text style={[type.label, { color: theme.textMuted, marginTop: space.lg }]}>API key</Text>
        <TextInput
          value={key}
          onChangeText={setKey}
          placeholder={hasKey ? 'Saved — paste to replace' : 'Paste your key'}
          placeholderTextColor={theme.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          style={input}
        />

        {PRESETS.filter((p) => p.baseUrl === base).map((p) => (
          <Pressable key={p.name} onPress={() => void Linking.openURL(p.keyUrl)} hitSlop={space.sm} style={{ marginTop: space.md }}>
            <Text style={[type.label, { color: theme.accentStrong }]}>Get a key from {p.name}</Text>
          </Pressable>
        ))}

        <Pressable
          accessibilityRole="button"
          disabled={!canSave || busy}
          onPress={save}
          style={[styles.primary, { backgroundColor: theme.accent }, (!canSave || busy) && { opacity: 0.4 }]}
        >
          {busy ? <ActivityIndicator color={theme.onAccent} /> : <Text style={[type.bodyStrong, { color: theme.onAccent }]}>Verify and save</Text>}
        </Pressable>

        {result ? (
          <Text style={[type.caption, { color: result.ok ? theme.affirm : theme.safety, marginTop: space.md, lineHeight: 19 }]}>
            {result.text}
          </Text>
        ) : null}

        <Text style={[type.caption, { color: theme.textFaint, marginTop: space.xl, lineHeight: 19 }]}>
          Your key is stored in the device keychain and sent only to the base URL above. The model must accept
          images. If scans fail with a 400, pick a different vision model. Web lookup for branded food is off on
          custom providers.
        </Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingBottom: space.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { paddingHorizontal: space.lg, paddingVertical: space.sm, borderRadius: radius.pill, minHeight: MIN_TAP_TARGET, justifyContent: 'center' },
  input: { marginTop: space.sm, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, paddingHorizontal: space.lg, paddingVertical: space.md, fontSize: 16 },
  primary: { marginTop: space.xl, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
})
