import { cn } from "@acme/ui"

interface RoomStatusBarProps {
    isBusy: boolean
}

export function RoomStatusBar({ isBusy }: RoomStatusBarProps) {
    const classNames = cn(
        "w-full h-10 py-8 flex items-center justify-center",
        {"bg-red-600": isBusy},
        {"bg-green-600": !isBusy}
    );

    return (
        <div className={classNames}>
            <p className="text-3xl text-white">{isBusy ? "Занято" : "Свободно"}</p>
        </div>
    )
}