import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // ユーザーを取得
    const { data: user, error } = await supabase
      .from('client_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'IDまたはパスワードが違います' }, { status: 401 });
    }

    // パスワード検証
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'IDまたはパスワードが違います' }, { status: 401 });
    }

    // 権限を取得
    const { data: permissions } = await supabase
      .from('client_permissions')
      .select('page')
      .eq('user_id', user.id);

    const pages = permissions?.map((p) => p.page) ?? ['shared'];

    // セッション情報をレスポンスに含める
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        pages,
      },
    });

    // Cookieにセッション情報を保存（7日間）
    response.cookies.set('client_session', JSON.stringify({
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      pages,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}