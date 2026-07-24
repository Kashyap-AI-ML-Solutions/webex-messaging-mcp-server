# Webex MCP Explainer — QA Record

- Candidate: `webex-mcp-explainer-15s.mp4`
- Status: awaiting human voice and lip-sync approval
- SHA-256: `e4977d485ae74a8931adcd2cd480204c1cce98dc6463bd76883a3e7bb9a7b003`
- Format: 15.000 seconds, 1280×720, 24 fps, H.264 video, stereo AAC audio at 96 kHz
- Final script: “AI agents notify customers, open incident rooms, manage Webex spaces, govern access, and automate approvals. Install the Webex MCP Server, connect Webex, and try it.”
- Narration route: native Veo dialogue generated in the same takes as the presenter's face and mouth motion; no external TTS or dubbed narrator is present
- Requested voice direction was included verbatim in both generation prompts: calm, clear, neutral-American male; warm baritone; approximately 140 WPM; professional and conversational; no uptalk or vocal fry; even tone with slight technical-term emphasis and natural pauses

## Generation audit

- Original deliverable: `dlv_7f164ba7`, actual spend $4.00
- Native-dialogue correction deliverable: `dlv_53178324`, actual spend $1.60
- Authorized cumulative maximum: $6.00
- Actual cumulative spend: $5.60
- Correction generations: 2 × 8-second Veo Fast scenes at $0.80 each
- Native opening run: `20260722-141542-7707c7`
- Native CTA run: `20260722-142329-48ed8f`
- Accepted infographic run: `20260722-131911-f46f70`
- Final separated visual judgment: `.amh/webex-video/lipsync-final-judgment.json`

## Editing and synchronization

- 0.0–1.7 s: native opening presenter video and its original synchronized native audio
- 1.7–8.0 s: clean full-screen infographic while the same opening-take voice continues off-screen
- 8.0–9.2 s: infographic scales down to reveal a closed-mouth presenter
- 9.2–15.0 s: native CTA presenter video and its original synchronized native audio
- The final CTA vector panel masks the raw model's malformed decorative labels; shipped on-screen wording comes from exact SVG/PNG overlays
- Visible presenter speech was not re-timed, time-stretched, or dubbed independently of its source facial motion

## Evaluation

- Final machine checks: pass
- Duration: 15.000 seconds exactly
- Frozen-video check: pass; mean frame delta 11.0389
- Scene consistency: pass; no undeclared jumps at declared cuts 1.7, 8.0, and 9.2 seconds
- Combined transcription versus final script: 1.000 similarity; exact transcript match
- Native opening transcription versus its script: 1.000 similarity
- Native CTA transcription versus its script: 1.000 similarity
- Final audio: -15.8 LUFS integrated, 4.2 LU loudness range, -1.4 dBFS true peak
- Final separated judge: pass; adherence 9/10, visual quality 9/10, coherence 9/10, text accuracy 10/10, sampled lip-motion plausibility 9/10
- Direct-frame visual QA verified all six business-use-case overlays and the CTA at full resolution; exact text is readable and correctly spelled
- Intra-frame H.264 master encoding preserves exact typography on every frame

## Human verdict

The prior robotic-voice and dubbed-lip-sync exports were rejected and preserved as `webex-mcp-explainer-15s-rejected-voice.mp4` and `webex-mcp-explainer-15s-rejected-lipsync.mp4`. This native-dialogue candidate is awaiting human approval because automated transcription and visual mouth-shape checks cannot certify subjective timbre or exact phoneme-to-lip alignment.
