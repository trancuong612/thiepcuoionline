import { redirect } from '@remix-run/node';
import { logout } from '../lib/auth.server';
export async function action({request}) {return redirect('/admin/login',{headers:{'Set-Cookie':await logout(request)}});}
export async function loader(){throw redirect('/admin');}
