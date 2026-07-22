# Webex MCP Explainer Video Design

Date: 2026-07-22

## Purpose

Create a polished short-form advertisement that shows customers and users how AI agents can turn business intent into governed Cisco Webex collaboration through the Webex Messaging MCP Server. The viewer should leave understanding the breadth of business outcomes and feel invited to install, connect, and try the server.

## Audience and Conversion Goal

The primary audience is prospective customers and hands-on users evaluating AI-agent integrations with Webex. The conversion goal is practical adoption: install the Webex MCP Server, connect it to Webex, and try a real workflow.

## Format

- 16:9 landscape, 1920×1080 delivery target.
- Short-ad pacing: approximately 15 seconds. The `agentic-media:media-video` skill generates two eight-second source scenes; the final editorial cut targets 15 seconds, while a 16-second source/QC master may be retained for auditability.
- Two generated scenes with one continuous visual idea: presenter → full-screen infographic → presenter.
- Maximum of six evaluated generation iterations per scene. Refinement stops as soon as a candidate passes all required checks; six is a ceiling, not a target.

## Governing Skill and Mandatory Workflow

This production must be executed with the `agentic-media:media-video` skill. Its workflow governs generation, evaluation, budget enforcement, refinement, and delivery. The render may not substitute an ad hoc video-generation process.

The required skill stages are:

1. **Host handshake and route check** — write `.amh/host_capabilities.json` for the Codex host and run `amh doctor --task video`. Video generation is BYO-key; if the doctor reports that the route is unavailable, stop and surface its setup guide.
2. **Repository-grounded storyboard and prompt enhancement** — create one prompt per scene in the exact token shape `subject: ...; action: ...; scene: ...; style: ...; camera_angle: ...; camera_movement: ...; sound_effects: ...`. Ground each scene in four to eight real repository names or terms. Dialogue may be placed in at most one scene. Run `amh eval prompt --task video` on every prompt and fix all errors before any paid call.
3. **Mandatory reference frames** — use the companion `agentic-media:media-image` loop to generate one reference frame per scene. Inspect every reference before video spend for presenter identity, hand anatomy, studio geometry, infographic physics, watermarks, and garbled text. A rejected reference is fixed before continuing.
4. **Deliverable budget, estimate, and consent** — create one deliverable estimate for two scenes and six maximum iterations per scene, then perform the required per-scene estimate before every generation. Use the deliverable ID and explicit consent on every paid call. Never bypass an exhausted or blocked budget.
5. **Per-scene machine checks and VQA** — run `amh eval video` for duration, codec, audio, real motion, and transcript matching where dialogue is present. Open the generated `vqa_questions.json`, watch the scene, answer every question honestly, and record the answers with `amh eval vqa-record`.
6. **Judge and refinement loop** — evaluate prompt adherence, visual quality, coherence, and creativity. Use a hash-matched separated-context judge where supported; otherwise record an honest self-judge. Apply specific prompt corrections and regenerate only when the verdict is `refine`, stopping after a pass or the six-iteration ceiling.
7. **Stitch and cross-scene verification** — stitch the accepted source scenes with `amh stitch`, then run the final motion, format, duration, audio, and declared-cut checks. The 15-second editorial derivative must receive an additional final check after typography, voice, sound, and timing are composited.
8. **Audited delivery and human gate** — report enhanced prompts, reference review, per-scene scores, cross-scene results, rejected attempts, and ledger cost. Because the worst-case budget exceeds $2, present the completed candidate for explicit human approval and record that verdict before declaring the render final.

No video-generation spend is authorized by this specification alone. The skill’s recorded estimate and consent gate remains mandatory.

## Business-Use-Case Analysis

The repository exposes 52 composable tools across messages, rooms, teams, memberships, people, webhooks/events, and enterprise content/actions. The video will therefore communicate six business outcome families instead of treating the server as a simple chat sender:

1. **Customer notifications** — use messages for proactive service updates, case milestones, maintenance notices, renewal reminders, and escalation communication.
2. **Incident response** — create a focused response space, add the appropriate responders, provide contextual tabs or artifacts, and coordinate resolution without manual room setup.
3. **Account collaboration** — establish and maintain customer teams and spaces for onboarding, implementation, customer success, and cross-functional account work.
4. **Access governance** — use people and membership operations to onboard, change roles, remove access, and keep collaboration spaces aligned with lifecycle and policy changes.
5. **Event-driven automation** — react to Webex events through webhooks, trigger downstream agent workflows, and keep business processes synchronized with collaboration activity.
6. **Knowledge and approvals** — connect enterprise content through ECM folders and room tabs, then capture structured decisions through attachment actions.

The spoken line names the highest-value examples that fit the duration; the full-screen infographic preserves the broader six-outcome story.

## Approved Script

> “Give AI agents a direct path from business intent to Webex action. Notify customers, launch incident rooms, organize account teams, govern access, and automate approvals. Install the Webex MCP Server, connect Webex, and try it.”

Delivery is a warm male baritone with a neutral American accent, approximately 140 words per minute. The performance is calm, clear, professional, and conversational, like a senior engineer speaking to a colleague. It uses an even cadence, no uptalk or vocal fry, natural sentence pauses, and slight emphasis on “AI agents,” “business intent,” and “Webex MCP Server.”

## Timeline and Storyboard

### Phase 1 — Human trust and premise

The video opens on a white American male presenter in his late 30s to mid-40s, framed in a medium shot. The premise begins as his voice is heard over the shot. Near the end of the first sentence, he turns naturally and points to a restrained floating Webex MCP visualization beside him. Keeping the opening as voice-over avoids false lip synchronization while preserving a human-led introduction.

### Phase 2 — Technology and business outcomes

A cyan data pulse follows his pointing gesture. The camera pushes through the floating MCP hub until the infographic fills the screen. The central “WEBEX MCP” hub activates six nodes in narration order. Thin animated connectors, soft data pulses, and subtle parallax explain that an AI agent selects and composes capabilities to achieve the desired outcome.

The exact visible labels are:

- Customer notifications
- Incident response
- Account collaboration
- Access governance
- Event automation
- Knowledge & approvals

Short capability labels may appear beneath the outcomes:

- Messages
- Rooms + Memberships
- Teams + Spaces
- People + Memberships
- Webhooks + Events
- ECM + Tabs + Actions

### Phase 3 — Return and conversion

After all outcomes activate, the camera pulls back along the same spatial path. The presenter is restored in the original studio position and visibly delivers the exact final call to action. A restrained end title reads “INSTALL • CONNECT • TRY.”

## Visual Direction

### Presenter and studio

- Non-identifiable white American male presenter, late 30s to mid-40s.
- Approachable, technically credible presence; natural grooming and understated styling.
- Charcoal overshirt or unstructured jacket over a neutral crew-neck shirt; no visible trademarks or logos.
- Minimal editorial studio: warm gray architectural wall, light wood or dark stone surface, a soft practical lamp, restrained blue accent illumination, and shallow depth of field.
- Soft key light, controlled fill, subtle rim light, natural skin texture, and no over-sharpened commercial gloss.
- Calm hand movement and one clearly motivated pointing gesture. No extra fingers, warped hands, face changes, or unexplained body movement.

### Infographic

- Premium enterprise editorial aesthetic using deep navy, cyan, teal, blue, and restrained violet.
- Flat-to-2.5D geometry with a central hub and six evenly spaced outcome nodes.
- Connector motion communicates intent → MCP orchestration → Webex outcome.
- The repository’s existing `assets/webex-mcp-business-outcomes.svg` provides the verified information architecture and color direction, but the video composition will be simplified for short-form readability.
- No fake Webex product UI, dense dashboards, tiny labels, watermarks, decorative pseudo-code, or invented capabilities.

### Typography and spelling safeguards

All important words are created as controlled vector overlays in post-production rather than entrusted to the generative video model. Labels use a clean system sans-serif, high contrast, generous spacing, and no more than two lines. Every on-screen string is checked against the approved label list before export and visually reviewed at full resolution and at typical mobile playback size.

## Motion and Transition Design

- The presenter’s pointing motion provides the causal trigger for the transition.
- The camera follows one continuous axis into and out of the infographic; no unrelated whip pans or spatial jumps.
- Movement uses smooth ease-in/ease-out curves, restrained parallax, and readable holds.
- The MCP hub activates first, followed by the outcome nodes in sync with the narration.
- The zoom-out retraces the established visual path so the final presenter framing feels physically continuous.
- Reference frames preserve the presenter’s face, clothing, studio geometry, hub placement, color palette, and light direction across generated material.

## Audio Design

- One continuous master voice track maintains vocal identity across the opening, off-camera infographic narration, and conclusion.
- The opening and middle portions are voice-over. Only the concluding call to action is visible speech, and it is synchronized to the master track in post-production.
- A low, warm ambient technology bed provides polish without competing with speech.
- Subtle activation ticks and a soft data swell reinforce the pointing gesture, hub activation, and final completion state.
- Dialogue remains clearly dominant, with no harsh transient effects or distracting musical change.

## Production Architecture

1. Generate and review a presenter/studio reference frame.
2. Generate and review a matching infographic reference frame grounded in repository terminology.
3. Generate one presenter source scene with stable appearance: a silent opening look and pointing gesture followed by the exact concluding line. Split this source editorially around the infographic so the opening and closing retain the same face, wardrobe, studio, and light.
4. Generate the full-screen infographic source scene with coherent camera motion and clean geometry; exclude critical text from the generated pixels.
5. Composite the verified vector labels, synchronize node activations to the narration, and add the continuous voice and restrained sound design.
6. Edit presenter opening → infographic → presenter closing into the final short-ad cut.
7. Retain generation, evaluation, and cost records in the Agentic Media Harness audit trail.

## Error Handling and Refinement Rules

- A flawed reference frame is rejected before video spend.
- Presenter identity drift, hand deformation, lip-sync failure, camera discontinuity, broken infographic geometry, illegible labels, or narration mismatch triggers refinement.
- Prompt corrections target the source of the defect. Reference-frame problems are fixed at the reference stage rather than repeatedly regenerating video from a poisoned reference.
- Paid generation follows the harness estimate and consent flow. Because the worst-case six-iteration budget is expected to exceed $2, the final asset requires a human approval gate before it is declared complete.
- Generation stops and the audit trail is surfaced if the deliverable budget is exhausted or a mandatory quality check cannot be passed within the iteration ceiling.

## Verification and Acceptance Criteria

The final video is acceptable only when all of the following are true:

- The final duration and codec checks pass, and both scenes contain real motion rather than frozen frames.
- The narration matches the approved script closely and remains intelligible throughout.
- The presenter’s face, wardrobe, skin tone, background, light direction, and body proportions remain coherent.
- The pointing gesture, zoom-in, infographic movement, zoom-out, and concluding shot form one understandable temporal sequence.
- All required labels are present, correctly spelled, readable, and aesthetically aligned.
- Each illustrated business outcome is supported by actual repository capabilities.
- Voice delivery matches the approved calm, warm, neutral-American technical style.
- Sound effects reinforce rather than obscure the narration.
- Per-scene VQA, judge evaluation, and final cross-scene checks pass, with rejected attempts retained in the audit trail.
- The final CTA clearly communicates installation, connection, and trial.

## Out of Scope

- A complete product tutorial or setup walkthrough.
- Detailed authentication, token-renewal, Docker, or transport configuration.
- Demonstrating all 52 tools individually.
- Fake customer names, fabricated performance claims, or simulated Webex screens presented as real product UI.
