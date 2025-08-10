\
    // /public/hide-features.js
    (function () {
      const targets = [
        "Judge an IJRU Scoring Competition",
        "Judge a RopeScore Competition",
        "Connect to a RopeScore Live Screen",
        "Stored Scoresheets",
        // plus some common typos/cases the user reported
        "judge an IJRU scoring competition",
        "judge a rope score competititon",
        "connect to a ropescore live screen",
        "stored scoresheet",
      ].map(t => t.trim().toLowerCase());

      function normalize(s){ return (s||"").replace(/\s+/g," ").trim().toLowerCase(); }

      const isForbidden = (txt) => targets.includes(normalize(txt));

      function removeContainingNode(node) {
        // Walk up to find a good container to remove (link/button/list item/card rows)
        let el = node;
        for (let i = 0; i < 5 && el && el !== document.body; i++) {
          if (el.matches && el.matches("a,button,li,.list-group-item,.menu-item,.item,.card,.card-body,.w-full,div,[role='button'],[role='link']")) {
            el.remove();
            return true;
          }
          el = el.parentElement;
        }
        // fallback
        if (node && node.remove) node.remove();
        return true;
      }

      function sweep(root) {
        if (!root || !root.querySelectorAll) return;
        const all = root.querySelectorAll("*");
        for (const el of all) {
          // Skip scripts/styles
          if (el.tagName === "SCRIPT" || el.tagName === "STYLE") continue;
          const txt = normalize(el.textContent || "");
          if (!txt) continue;
          // Match *exact* items or lines that are exactly those strings
          if (isForbidden(txt)) {
            removeContainingNode(el);
            continue;
          }
          // Also support elements whose first child or aria-label equals the target
          const al = normalize(el.getAttribute && el.getAttribute("aria-label"));
          if (al && isForbidden(al)) {
            removeContainingNode(el);
            continue;
          }
        }
      }

      // Run now and observe mutations (SPA renders after load)
      const run = () => {
        try { sweep(document.body); } catch (e) {}
      };

      // Initial & a few retries
      run();
      let tries = 0;
      const retry = setInterval(() => {
        run();
        if (++tries > 20) clearInterval(retry);
      }, 200);

      // MutationObserver for dynamic rerenders
      const mo = new MutationObserver((m) => {
        for (const rec of m) {
          if (rec.addedNodes) {
            for (const n of rec.addedNodes) {
              if (n.nodeType === 1) sweep(n);
            }
          }
        }
      });
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    })();
