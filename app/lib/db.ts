import { supabase } from './supabase';

// ==========================================
// 期間別レポートをDBから取得する関数
// ==========================================
export async function getReportDataFromDB(from?: string, to?: string) {
  let query = supabase
    .from('daily_reports')
    .select('*')
    .order('date', { ascending: true });

  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((d) => ({
    date: d.date,
    pv: d.pv,
    imp: d.imp,
    impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
    cl: d.cl,
    ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
    friend: d.friend,
    friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
    cv: d.cv,
    cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
    billing: d.billing,
  }));
}

// ==========================================
// ポップアップ別レポートをDBから取得する関数
// ==========================================
export async function getReportDataByPFromDB(pValue: string, from?: string, to?: string) {
  let query = supabase
    .from('daily_reports_by_p')
    .select('*')
    .eq('p_value', pValue)
    .order('date', { ascending: true });

  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((d) => ({
    date: d.date,
    pv: d.pv,
    imp: d.imp,
    impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
    cl: d.cl,
    ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
    friend: d.friend,
    friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
    cv: d.cv,
    cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
    billing: d.billing,
  }));
}

// ==========================================
// シナリオ別レポートをDBから取得する関数
// ==========================================
export async function getReportDataBySFromDB(sValue: string, from?: string, to?: string) {
  let query = supabase
    .from('daily_reports_by_s')
    .select('*')
    .eq('s_value', sValue)
    .order('date', { ascending: true });

  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((d) => ({
    date: d.date,
    pv: d.pv,
    imp: d.imp,
    impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
    cl: d.cl,
    ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
    friend: d.friend,
    friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
    cv: d.cv,
    cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
    billing: d.billing,
  }));
}

// ==========================================
// 離脱地点別レポートをDBから取得する関数
// ==========================================
export async function getReportDataByExitFromDB(exitValue: string, from?: string, to?: string) {
  let query = supabase
    .from('daily_reports_by_exit')
    .select('*')
    .eq('exit_value', exitValue)
    .order('date', { ascending: true });

  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((d) => ({
    date: d.date,
    pv: d.pv,
    imp: d.imp,
    impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
    cl: d.cl,
    ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
    friend: d.friend,
    friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
  }));
}

// ==========================================
// 訴求別レポートをDBから取得する関数
// ==========================================
export async function getReportDataByAppealFromDB(appealValue: string, from?: string, to?: string) {
  let query = supabase
    .from('daily_reports_by_appeal')
    .select('*')
    .eq('appeal_value', appealValue)
    .order('date', { ascending: true });

  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((d) => ({
    date: d.date,
    pv: d.pv,
    imp: d.imp,
    impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
    cl: d.cl,
    ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
    friend: d.friend,
    friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
    cv: d.cv,
    cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
    billing: d.billing,
  }));
}

// ==========================================
// 期間別（共有用）レポートをDBから取得する関数
// daily_reportsとdaily_reports_sharedを結合して返す
// ==========================================
export async function getSharedReportDataFromDB(from?: string, to?: string) {
  let baseQuery = supabase
    .from('daily_reports')
    .select('*')
    .order('date', { ascending: true });

  if (from) baseQuery = baseQuery.gte('date', from);
  if (to) baseQuery = baseQuery.lte('date', to);

  let sharedQuery = supabase
    .from('daily_reports_shared')
    .select('*')
    .order('date', { ascending: true });

  if (from) sharedQuery = sharedQuery.gte('date', from);
  if (to) sharedQuery = sharedQuery.lte('date', to);

  const [baseData, sharedData] = await Promise.all([baseQuery, sharedQuery]);

  if (baseData.error) throw new Error(baseData.error.message);
  if (sharedData.error) throw new Error(sharedData.error.message);

  // 日付をキーにしたsharedMapを作成
  const sharedMap: Record<string, { cv: number; unit_price: number; billing: number }> = {};
  for (const d of sharedData.data ?? []) {
    sharedMap[d.date] = {
      cv: d.cv,
      unit_price: d.unit_price,
      billing: d.billing,
    };
  }

  return (baseData.data ?? []).map((d) => {
    const shared = sharedMap[d.date];
    const cv = shared?.cv ?? 0;
    const unitPrice = shared?.unit_price ?? 0;
    const billing = shared?.billing ?? 0;

    return {
      date: d.date,
      pv: d.pv,
      imp: d.imp,
      impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
      cl: d.cl,
      ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
      friend: d.friend,
      friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
      cv,
      cvr: d.friend > 0 ? ((cv / d.friend) * 100).toFixed(2) + '%' : '-',
      unitPrice,
      billing,
    };
  });
}

// ==========================================
// 訴求の選択肢一覧をDBから取得する関数
// ==========================================
export async function getAppealValuesFromDB(): Promise<string[]> {
  const { data, error } = await supabase
    .from('distinct_appeal_values')
    .select('appeal_value');

  if (error) throw new Error(error.message);

  return (data?.map((d) => d.appeal_value) ?? []).sort();
}

// ==========================================
// 直近1週間にデータがある訴求一覧をDBから取得する関数
// ==========================================
export async function getActiveAppealValuesFromDB(): Promise<string[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const fromDate = oneWeekAgo.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('daily_reports_by_appeal')
    .select('appeal_value')
    .gte('date', fromDate)
    .order('appeal_value', { ascending: true });

  if (error) throw new Error(error.message);

  const values = new Set<string>(data?.map((d) => d.appeal_value) ?? []);
  return [...values].sort();
}

// ==========================================
// ポップアップの選択肢一覧をDBから取得する関数
// ==========================================
export async function getPValuesFromDB(): Promise<string[]> {
  const { data, error } = await supabase
    .from('distinct_p_values')
    .select('p_value');

  if (error) throw new Error(error.message);

  return (data?.map((d) => d.p_value) ?? []).sort();
}

// ==========================================
// シナリオの選択肢一覧をDBから取得する関数
// ==========================================
export async function getSValuesFromDB(): Promise<string[]> {
  const { data, error } = await supabase
    .from('distinct_s_values')
    .select('s_value');

  if (error) throw new Error(error.message);

  return (data?.map((d) => d.s_value) ?? []).sort();
}

// ==========================================
// 離脱地点の選択肢一覧をDBから取得する関数
// ==========================================
export async function getExitValuesFromDB(): Promise<string[]> {
  const { data, error } = await supabase
    .from('distinct_exit_values')
    .select('exit_value');

  if (error) throw new Error(error.message);

  return (data?.map((d) => d.exit_value) ?? []).sort();
}

// ==========================================
// サマリ用：月別・p別・s別をDBから取得してまとめて集計する関数
// ==========================================
export async function getSummaryDataFromDB() {
  const [dailyData, pData, sData] = await Promise.all([
    supabase.from('daily_reports').select('*').order('date', { ascending: true }).limit(10000),
    supabase.from('summary_by_p').select('*'),
    supabase.from('summary_by_s').select('*'),
  ]);

  if (dailyData.error) throw new Error(dailyData.error.message);
  if (pData.error) throw new Error(pData.error.message);
  if (sData.error) throw new Error(sData.error.message);

  // 月別集計
  const monthMap: Record<string, {
    pv: number; imp: number; cl: number; friend: number; cv: number; billing: number;
  }> = {};

  for (const d of dailyData.data ?? []) {
    const month = d.date.slice(0, 7);
    if (!monthMap[month]) monthMap[month] = { pv: 0, imp: 0, cl: 0, friend: 0, cv: 0, billing: 0 };
    monthMap[month].pv += d.pv;
    monthMap[month].imp += d.imp;
    monthMap[month].cl += d.cl;
    monthMap[month].friend += d.friend;
    monthMap[month].cv += d.cv;
    monthMap[month].billing += d.billing ?? 0;
  }

  const totalPv = (dailyData.data ?? []).reduce((acc, d) => acc + d.pv, 0);

  // 月別の出力
  const byMonth = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({
      label: month,
      pv: d.pv,
      imp: d.imp,
      impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
      cl: d.cl,
      ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
      friend: d.friend,
      friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
      cv: d.cv,
      cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
      billing: d.billing,
    }));

  // p別の出力（ビューから直接取得）
  const byP = (pData.data ?? [])
    .sort((a, b) => a.p_value.localeCompare(b.p_value))
    .map((d) => ({
      label: d.p_value,
      pv: totalPv,
      imp: d.imp,
      impRate: totalPv > 0 ? ((d.imp / totalPv) * 100).toFixed(2) + '%' : '-',
      cl: d.cl,
      ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
      friend: d.friend,
      friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
      cv: d.cv,
      cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
      billing: d.billing,
    }));

  // s別の出力（ビューから直接取得）
  const byS = (sData.data ?? [])
    .sort((a, b) => a.s_value.localeCompare(b.s_value))
    .map((d) => ({
      label: d.s_value,
      pv: totalPv,
      imp: d.imp,
      impRate: totalPv > 0 ? ((d.imp / totalPv) * 100).toFixed(2) + '%' : '-',
      cl: d.cl,
      ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
      friend: d.friend,
      friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
      cv: d.cv,
      cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
      billing: d.billing,
    }));

  return { byMonth, byP, byS };
}


// ==========================================
// 直近1週間にデータがあるポップアップ一覧をDBから取得する関数
// ==========================================
export async function getActivePValuesFromDB(): Promise<string[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const fromDate = oneWeekAgo.toISOString().slice(0, 10); // "2026-06-25"

  const { data, error } = await supabase
    .from('daily_reports_by_p')
    .select('p_value')
    .gte('date', fromDate)
    .order('p_value', { ascending: true });

  if (error) throw new Error(error.message);

  const values = new Set<string>(data?.map((d) => d.p_value) ?? []);
  return [...values].sort();
}

// ==========================================
// 直近1週間にデータがあるシナリオ一覧をDBから取得する関数
// ==========================================
export async function getActiveSValuesFromDB(): Promise<string[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const fromDate = oneWeekAgo.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('daily_reports_by_s')
    .select('s_value')
    .gte('date', fromDate)
    .order('s_value', { ascending: true });

  if (error) throw new Error(error.message);

  const values = new Set<string>(data?.map((d) => d.s_value) ?? []);
  return [...values].sort();
}

// ==========================================
// メモを取得する関数
// ==========================================
export async function getNotesFromDB(from?: string, to?: string) {
  let query = supabase
    .from('daily_notes')
    .select('date, note')
    .order('date', { ascending: true });

  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  // 日付をキーにしたオブジェクトで返す
  const noteMap: Record<string, string> = {};
  for (const d of data ?? []) {
    noteMap[d.date] = d.note;
  }
  return noteMap;
}

// ==========================================
// メモを保存する関数
// ==========================================
export async function upsertNoteFromDB(date: string, note: string) {
  const { error } = await supabase
    .from('daily_notes')
    .upsert({ date, note, updated_at: new Date().toISOString() }, { onConflict: 'date' });

  if (error) throw new Error(error.message);
}