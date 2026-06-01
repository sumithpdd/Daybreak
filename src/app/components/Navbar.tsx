'use client'

import Dropdown from "./Dropdown";
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { setCurrentBoardName, getCurrentBoardName, openAddAndEditTaskModal, openTagManagementModal } from '@/redux/features/appSlice'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { useFetchBoardsQuery } from "@/redux/services/apiSlice";
import { useSession, signIn, signOut } from '@/lib/session';
import { SunMark } from './morning/Logo';

export default function Navbar() {
  const [show, setShow] = useState<boolean>(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const { data: boards } = useFetchBoardsQuery();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (boards && boards.length > 0) {
      dispatch(setCurrentBoardName(boards[0].name));
    }
  }, [boards, dispatch]);

  const currentBoardName = useAppSelector(getCurrentBoardName);

  const isOKRPage = pathname === '/okrs';
  const isBoardPage = pathname?.startsWith('/board');
  const isCalendarPage = pathname === '/calendar';

  return (
    <nav className="bg-white border flex h-20 shrink-0">
      <div className="flex-none w-[18.75rem] border-r-2 flex items-center gap-2 pl-[2.12rem]">
        <SunMark className="h-8 w-8" />
        <p className="font-bold text-2xl">Daybreak</p>
      </div>

      <div className="flex-1 flex items-center justify-between px-6">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded-lg font-medium transition bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              🌅 Morning
            </button>
            <button
              onClick={() => router.push('/board')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isBoardPage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Boards
            </button>
            <button
              onClick={() => router.push('/okrs')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isOKRPage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎯 OKRs
            </button>
            <button
              onClick={() => router.push('/calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isCalendarPage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📅 Calendar
            </button>
          </div>

          {isBoardPage && (
            <p className="text-black text-2xl font-bold">{currentBoardName}</p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {session ? (
            <button
              type="button"
              onClick={() => router.push('/profile')}
              title="Edit profile"
              className="flex items-center space-x-3 rounded-lg px-2 py-1 transition hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-xs text-gray-500">{session.user?.email}</p>
              </div>
            </button>
          ) : (
            <div className="text-sm text-gray-500">
              {status === 'loading' ? 'Loading...' : 'Not signed in'}
            </div>
          )}

          <div className="flex items-center space-x-3">
            {session && (
              <>
                <button
                  type='button'
                  onClick={() => dispatch(openAddAndEditTaskModal({ variant: 'Add New Task' }))}
                  className="bg-blue-500 text-white px-4 py-2 flex rounded-3xl items-center space-x-2">
                  <p>+ Add New Task</p>
                </button>
                <button
                  type='button'
                  onClick={() => dispatch(openTagManagementModal())}
                  className="bg-green-500 text-white px-4 py-2 flex rounded-3xl items-center space-x-2">
                  <p>🏷️ Manage Tags</p>
                </button>
              </>
            )}

            <div className="relative flex items-center">
              <button onClick={() => setShow(!show)} className="text-3xl mb-4">
                ...
              </button>
              <Dropdown show={show} />
            </div>

            {session ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => signIn()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
