# 📱 Go-Live Guide — launch from your phone

**Launching = merging `dev` → `main` on GitHub.** That automatically deploys to **ujyalo.app**.
No laptop needed. Already checked: it's a **clean merge, no conflicts.**

---

## ✅ Before you leave (do this now, once)
- [ ] Make sure you can **log into GitHub on your phone**: open **github.com**, sign in as **`ujyaloapp`**. Test it now so there's no surprise on launch day.

---

## 🚀 Launch (phone browser, ~3 minutes)
1. Open this link on your phone:
   **https://github.com/ujyaloapp/ujyalo/compare/main...dev**
2. Tap **Create pull request**
3. Title it **Go live** → tap **Create pull request** again
4. Tap the green **Merge pull request** → then **Confirm merge**
5. ✅ Done — Vercel now builds and deploys to **ujyalo.app** automatically (~1–2 min)

---

## 🔍 Check it worked (phone)
Wait ~2 minutes, then open **https://ujyalo.app** and confirm:
- [ ] Homepage loads with the new design
- [ ] **Sign up** / **Log in** works
- [ ] A **past paper** opens

---

## 🛟 If something looks broken (safety net — also on phone)
1. Open **vercel.com** → project **`ujyalo`** → **Deployments**
2. Find the **previous Production** deployment (the one from *before* today)
3. Tap **⋯ → Instant Rollback** (or "Promote to Production")
4. The old site is restored in seconds. Then message me later (with your laptop) and we'll fix the issue.

---

## Notes
- The merge brings **182 commits** live at once — that's all the redesign + fixes we did. Expected.
- From your phone you can **launch** and **roll back**. But fixing a *code* bug needs your **laptop** — that's why we tested everything on `dev` first.
- You can reach a Claude assistant from your phone to talk you through any GitHub/Vercel screen.
