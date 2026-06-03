# Paalan

**Care for aging parents who live across the world, and actually know each thing got done.**

*Paalan*: to nurture, to look after.

> Launched solo on X and Reddit. Strangers were signing up within 24 hours.

## The problem

A lot of people support aging parents who live in another country. Bills, doctor's appointments, and payments all happen thousands of miles away, and there is no clean way to track them or confirm they actually got done. Group chats and spreadsheets fall apart fast, and "did you pay the electricity bill?" turns into a guessing game.

## What Paalan does

Paalan turns scattered care tasks into a verifiable record. Every bill, appointment, and payment is logged as an entry backed by proof (a receipt or a photo), so you can confirm something happened even from the other side of the world.

Two surfaces, one source of truth:

- **Management dashboard** for the family member coordinating from abroad: full history, status, and proof for every task.
- **Parent view**, a stripped-down, low-friction screen so the parent (or a local helper) can add or confirm things without fuss.

## Features

- Track bills, appointments, and payments in one place
- Proof attached to every entry (receipt or photo) for remote verification
- Role-based access, so caregiver, parent, and local helper each get the right view
- Provider- and country-agnostic by design, with no assumptions about banks, hospitals, or currency
- Append-only, timestamped event log, so nothing gets lost or quietly overwritten

## The AI layer

The real friction in a tool like this is data entry, so Paalan removes it.

- **WhatsApp to structured entry:** a casual message like *"paid 2000 for mom's eye checkup"* becomes a typed entry (payee, amount, category, status) on its own.
- **Built to extend** (on the roadmap): pull those same fields straight from a photo of a bill, and summarize a medical report written in a regional language into plain English for the family.

## How it's built

- The data model is an **event log of typed, timestamped, role-based records**. It is append-only, so history stays auditable and both the parent and caregiver views derive from the same underlying truth.
- Kept **provider- and country-agnostic** so it works no matter which bank, hospital, or messaging app a family uses.

## Tech stack

React · TypeScript · LLM-based parsing for the message-to-entry flow

## Run it locally

```bash
git clone https://github.com/thak005004/Paalan.git
cd Paalan
npm install
npm run dev
```

> Adjust the commands and environment variables to match your setup, and add a `.env.example` for any API keys.

## Status

Live prototype with real signups, actively iterating.

---

Built by **Aditi Thakur** · [github.com/thak005004](https://github.com/thak005004) · [LinkedIn](https://www.linkedin.com/in/thakuraditi005)
