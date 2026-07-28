import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/app/lib/supabase';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

// ユーザー更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email?.endsWith('@5s-inc.jp')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { password, displayName, pages, isActive } = await request.json();

    const updateData: Record<string, unknown> = {
      display_name: displayName,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const { error } = await supabase
      .from('client_users')
      .update(updateData)
      .eq('id', id);

    if (error) throw new Error(error.message);

    if (pages) {
      await supabase.from('client_permissions').delete().eq('user_id', id);
      await supabase.from('client_permissions').insert(
        pages.map((page: string) => ({ user_id: id, page }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ユーザー削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email?.endsWith('@5s-inc.jp')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('client_users')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}