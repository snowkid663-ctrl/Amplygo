# AmplyGo — Design Language

**Status:** adopted (rolling out)
**Last updated:** 2026-07-24

## Core idea

AmplyGo is **infrastructure for scalable organic distribution** — not "another
influencer tool". The visual identity revolves around **connections, networks
and organic growth**: companies ↔ creators ↔ audiences ↔ millions of people.

The UI should feel like a **living network** that continuously grows. Own
"network-based visuals" the way Stripe owns gradients, Linear owns precision,
Notion owns blocks.

## Visual system (reusable)

- **Nodes** (creators, campaigns, audiences) — dots, sized by performance.
- **Connections** — curved/straight lines linking nodes; brighter when closer.
- **Network fields** — drifting particle constellations (backgrounds).
- **Expansion** — structures that grow outward from a single origin.
- Palette: dark base + **tech green / cyan** accents (existing tokens).
- Keep it minimal & premium — the network is ambient, never noisy.

## Motion principles

Every animation should represent **distribution**, never random decoration:
nodes connecting, pulses travelling along links, new creators lighting up the
graph, a campaign growing from one point into thousands of connections.
Always respect `prefers-reduced-motion`.

## Where it shows

- **Login / auth flow** → animated galaxy/network field (interactive with cursor). ✅ shipped (`NetworkBackground`)
- **Hero** → a subtly growing network behind the copy. (todo)
- **Campaign dashboard** → visualize the campaign as its own network (each
  creator a node, top performers larger, new joins expand it). (todo)
- **Empty states** → a single node "waiting for connections"; grows as creators join. (todo)
- Marketing, loading screens, illustrations, case studies. (todo)

## Components

- `NetworkBackground` — canvas particle-network field (cursor-interactive,
  reduced-motion aware). Used on auth + onboarding.
- (todo) `CampaignNetwork` — data-driven node graph of a campaign's creators.
- (todo) `NodeEmptyState` — lonely node that invites connection.

## Feeling
Connected · Intelligent · Organic · Expanding · Distributed · Alive · Modern ·
Minimal · Premium. Less "software dashboard", more "the world's largest creator
network".
