import { useCountdown } from "../hooks/soft-axis"

export const CountDown = ({ date }: { date: Date }) => {
    const { timer } = useCountdown(date)

    return (
        <>
            {timer.days}d {timer.hours}h {timer.minutes}m {timer.seconds}s
        </>
    )
}
