document.addEventListener('DOMContentLoaded', () => {
  const totalMembers = document.querySelector('[data-stat="totalMembers"]');
  const onlineMembers = document.querySelector('[data-stat="onlineMembers"]');
  const discordOnline = document.querySelector('[data-discord-online]');
  const stats = document.querySelector('.stats');

  if ((!totalMembers || !onlineMembers || !stats) && !discordOnline) return;

  let hasLoadedStats = false;

  async function refreshStats() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('/api/discord/stats', {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal
      });

      if (!response.ok) throw new Error('Statistics unavailable');

      const data = await response.json();
      if (!data ||
          typeof data.serverName !== 'string' ||
          !Number.isSafeInteger(data.totalMembers) ||
          data.totalMembers < 0 ||
          !Number.isSafeInteger(data.onlineMembers) ||
          data.onlineMembers < 0 ||
          typeof data.lastUpdated !== 'string' ||
          !Number.isFinite(Date.parse(data.lastUpdated))) {
        throw new Error('Invalid statistics response');
      }

      if (totalMembers && onlineMembers && stats) {
        totalMembers.textContent = data.totalMembers.toLocaleString();
        onlineMembers.textContent = data.onlineMembers.toLocaleString();
        totalMembers.setAttribute('aria-busy', 'false');
        onlineMembers.setAttribute('aria-busy', 'false');
        stats.setAttribute('aria-label', `${data.serverName} community highlights`);
        stats.dataset.stale = String(data.stale === true);
      }

      if (discordOnline) {
        discordOnline.textContent = data.onlineMembers.toLocaleString();
        discordOnline.setAttribute('aria-busy', 'false');
      }

      hasLoadedStats = true;
    } catch (error) {
      if (!hasLoadedStats && totalMembers && onlineMembers) {
        totalMembers.textContent = 'Unavailable';
        onlineMembers.textContent = 'Unavailable';
        totalMembers.setAttribute('aria-busy', 'false');
        onlineMembers.setAttribute('aria-busy', 'false');
      }
      if (!hasLoadedStats && discordOnline) {
        discordOnline.textContent = 'Unavailable';
        discordOnline.setAttribute('aria-busy', 'false');
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  refreshStats();
  setInterval(refreshStats, 60 * 1000);
});
