export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex min-h-0 flex-1 flex-col gap-0">{children}</div>
}
