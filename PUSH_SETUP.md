# Push Notifications Setup

The frontend code is in place — service worker, permission flow, token save, and triggers
on every notification site (new application, application accepted/declined, new message).

You need to do **3 things** to make push notifications actually fire on devices:

## 1. Generate the VAPID key (Firebase Console)

1. Go to https://console.firebase.google.com/project/load-leader/settings/cloudmessaging
2. Scroll to **Web configuration** → **Web Push certificates**
3. Click **Generate key pair**
4. Copy the public key — looks like `BG3p...` (long base64 string)

In **dashboard.html** and **carrier-dashboard.html**, find this line near the top of the script section:

```javascript
const FCM_VAPID_KEY = '';
```

Paste your key inside the empty quotes in **both** files. Commit and push.

## 2. Add the push endpoint to your server (loadleader-api repo)

Edit `server.js` in your `loadleader-api` repo (the Render backend) and add this block.
You also need to install the Firebase Admin SDK: `npm install firebase-admin`.

```javascript
// At the top of server.js with other requires
const admin = require('firebase-admin');

// Initialize Firebase Admin (uses FIREBASE_SERVICE_ACCOUNT env var, see step 3)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  if (serviceAccount.project_id) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT not configured — push disabled');
  }
}

// Push endpoint
app.post('/api/push', async (req, res) => {
  try {
    if (!admin.apps.length) return res.json({ skipped: true });
    const { userId, title, body, data } = req.body || {};
    if (!userId || !title) return res.status(400).json({ error: 'userId and title required' });

    // Look up the user's FCM token
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const token = userDoc.exists && userDoc.data().fcmToken;
    if (!token) return res.json({ skipped: true, reason: 'no_token' });

    // Convert all data values to strings (FCM requires strings)
    const stringData = {};
    Object.entries(data || {}).forEach(([k, v]) => { stringData[k] = String(v); });

    await admin.messaging().send({
      token,
      notification: { title, body: body || '' },
      data: stringData,
      webpush: {
        fcmOptions: { link: stringData.url || '/' }
      }
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('Push error:', e.message);
    // If token is stale/invalid, clear it so we don't keep trying
    if (e.code === 'messaging/registration-token-not-registered' && req.body.userId) {
      try { await admin.firestore().collection('users').doc(req.body.userId).update({ fcmToken: null }); } catch(_) {}
    }
    res.status(500).json({ error: e.message });
  }
});
```

## 3. Add Firebase Admin credentials to Render

1. Go to https://console.firebase.google.com/project/load-leader/settings/serviceaccounts/adminsdk
2. Click **Generate new private key** → downloads a JSON file
3. Open the JSON file, copy its **entire contents** (one big JSON object)
4. In Render, open your `loadleader-api` service → **Environment** → **Add Environment Variable**
   - Key: `FIREBASE_SERVICE_ACCOUNT`
   - Value: paste the JSON content (it will be one long string)
5. Save — Render will redeploy automatically

## 4. Verify

1. Open https://loadleaderservice.com on a real device or another browser
2. Log in — you should get a permission prompt asking to enable notifications
3. Click **Allow**
4. Have another account post an application or send you a message
5. You should get a system-level notification

If nothing fires, check:
- Browser console on the dashboard for `Push init failed:` warnings
- Render logs for `Push error:` messages
- `users/{yourUid}` doc in Firestore should have an `fcmToken` field

## Notes

- iOS Safari requires the site to be **installed to the home screen as a PWA** for push to work (iOS 16.4+). On Android Chrome, desktop Chrome/Firefox/Edge it works in any browser tab.
- The `fcmToken` rotates over time — the frontend re-saves it on every login.
- `display:none` on the Earnings panel keeps payment UI hidden — re-enable when payouts are ready.
