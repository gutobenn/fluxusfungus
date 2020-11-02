import { GooSpinner } from 'react-spinners-kit'

export default function Loading() {
  return (
    <div className="h-screen text-center flex flex-col items-center justify-center">
      <GooSpinner size={70} color="#E1C0AF" loading={true} />
    </div>
  )
}
