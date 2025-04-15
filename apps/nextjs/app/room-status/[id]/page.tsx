import type { Metadata } from 'next'

import { RoomStatus } from '~/../src/widgets/room-status-page/index'

export const metadata: Metadata = {
    title: 'Conference Room Status',
    description: 'Status page for conference room',
}

export default async function RoomStatusPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <RoomStatus id={id} />
}



