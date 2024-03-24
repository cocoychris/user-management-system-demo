import './Box.css';
export default function Box({
  className,
  direction='column',
  children,
}: {
  className?: string;
  direction?: 'row' | 'column';
  children: React.ReactNode;
}) {
  const classNameList = ['box', `box-direction-${direction}`];
  className && classNameList.push(className);
  return <section className={classNameList.join(' ')}>{children}</section>;
}
