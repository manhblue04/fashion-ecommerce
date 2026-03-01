import { HiOutlineInbox } from 'react-icons/hi'

export default function EmptyState({ icon: Icon = HiOutlineInbox, title = 'Không có dữ liệu', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {action}
    </div>
  )
}
