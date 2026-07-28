import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/app/lib/supabase';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

// ユーザー一覧取得
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email?.endsWith('@5s-inc.jp')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('client_users')
      .select(`
        *,
        client_permissions(page)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ユーザー作成
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email?.endsWith('@5s-inc.jp')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username, password, displayName, pages } = await request.json();

    // パスワードをハッシュ化
    const passwordHash = await bcrypt.hash(password, 10);

    // ユーザー作成
    const { data: user, error } = await supabase
      .from('client_users')
      .insert({ username, password_hash: passwordHash, display_name: displayName })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // 権限設定（デフォルト: shared）
    const permPages = pages ?? ['shared'];
    const { error: permError } = await supabase
      .from('client_permissions')
      .insert(permPages.map((page: string) => ({ user_id: user.id, page })));

    if (permError) throw new Error(permError.message);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}