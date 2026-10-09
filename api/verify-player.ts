export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUid = String(req.query?.uid || '').trim();
  const uid = rawUid.replace(/\D/g, '');
  const regionParam = String(req.query?.region || 'ind').trim().toLowerCase();

  if (!uid || uid.length < 6) {
    return res.status(400).json({
      success: false,
      verified: false,
      message: 'Invalid Player UID format (min 6 digits)',
    });
  }

  let primaryReg = 'ind';
  if (regionParam.includes('bd') || regionParam.includes('bangladesh')) primaryReg = 'bd';
  else if (regionParam.includes('pk') || regionParam.includes('pakistan')) primaryReg = 'pk';
  else if (regionParam.includes('sg') || regionParam.includes('sea')) primaryReg = 'sg';
  else if (regionParam.includes('br')) primaryReg = 'br';

  const useruid = process.env.HL_GAMING_USERUID || 'Hwjexp62zVM8HZB7cj8L8MUVTSp1';
  const api = process.env.HL_GAMING_API_KEY || 'Nomxie0704MWk3ikyDJhaT9EyNZ1dK';

  const candidateRegions = [primaryReg, 'ind', 'bd', 'pk', 'sg', 'br', 'id'].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  for (const reg of candidateRegions) {
    try {
      const hlUrl = `https://proapis.hlgamingofficial.com/main/games/freefire/account/api?sectionName=AllData&PlayerUid=${encodeURIComponent(uid)}&region=${encodeURIComponent(reg)}&useruid=${encodeURIComponent(useruid)}&api=${encodeURIComponent(api)}`;
      const response = await fetch(hlUrl);
      if (!response.ok) continue;

      const raw = await response.text();
      let data: any = null;
      try { data = JSON.parse(raw); } catch {}

      if (!data || data.error) continue;

      const root = data.result || data.data || data;
      const accountInfo = root.AccountInfo || root.accountInfo || root.captainBasicInfo || root;
      const guildInfo = root.GuildInfo || root.guildInfo || {};

      const nickname =
        accountInfo.AccountName ||
        root.AccountName ||
        accountInfo.nickname ||
        root.nickname;

      if (nickname && String(nickname).trim() !== '') {
        return res.status(200).json({
          success: true,
          verified: true,
          player: {
            uid,
            name: String(nickname),
            level: Number(accountInfo.AccountLevel || 70),
            likes: Number(accountInfo.AccountLikes || 0),
            guild: guildInfo.GuildName || undefined,
            region: (accountInfo.AccountRegion || reg).toUpperCase(),
            brRankPoint: accountInfo.BrRankPoint ? Number(accountInfo.BrRankPoint) : undefined,
          },
        });
      }
    } catch {}
  }

  return res.status(200).json({
    success: true,
    verified: true,
    notFoundInGame: true,
    player: {
      uid,
      name: '',
      level: 70,
      region: primaryReg.toUpperCase(),
    },
  });
}
