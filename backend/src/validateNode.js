/* eslint-env node */
/* eslint-disable no-undef */ // necessary for CI

import("../dist/backend/src/app.js")
  .then(() => {
    console.log("App initialized successfully");
    process.exit(0); // terminate on success to avoid hangup
  })
  .catch((err) => {
    console.error("App initialization failed:", err);
    process.exit(1);
  });
