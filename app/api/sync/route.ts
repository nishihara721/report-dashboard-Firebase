import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-sync-secret');
    if (authHeader !== process.env.SYNC_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dateMap, pMap, sMap, exitMap, appealMap, sharedMap } = body;

    // daily_reports への保存
    if (dateMap && dateMap.length > 0) {
      const { error } = await supabase
        .from('daily_reports')
        .upsert(dateMap, { onConflict: 'date' });
      if (error) throw new Error('daily_reports: ' + error.message);
    }

    // daily_reports_by_p への保存
    if (pMap && pMap.length > 0) {
      const { error } = await supabase
        .from('daily_reports_by_p')
        .upsert(pMap, { onConflict: 'date,p_value' });
      if (error) throw new Error('daily_reports_by_p: ' + error.message);
    }

    // daily_reports_by_s への保存
    if (sMap && sMap.length > 0) {
      const { error } = await supabase
        .from('daily_reports_by_s')
        .upsert(sMap, { onConflict: 'date,s_value' });
      if (error) throw new Error('daily_reports_by_s: ' + error.message);
    }

    // daily_reports_by_exit への保存
    if (exitMap && exitMap.length > 0) {
      const { error } = await supabase
        .from('daily_reports_by_exit')
        .upsert(exitMap, { onConflict: 'date,exit_value' });
      if (error) throw new Error('daily_reports_by_exit: ' + error.message);
    }

    // daily_reports_by_appeal への保存
    if (appealMap && appealMap.length > 0) {
      const { error } = await supabase
        .from('daily_reports_by_appeal')
        .upsert(appealMap, { onConflict: 'date,appeal_value' });
      if (error) throw new Error('daily_reports_by_appeal: ' + error.message);
    }

    // daily_reports_shared への保存
    if (sharedMap && sharedMap.length > 0) {
      const { error } = await supabase
        .from('daily_reports_shared')
        .upsert(sharedMap, { onConflict: 'date' });
      if (error) throw new Error('daily_reports_shared: ' + error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}