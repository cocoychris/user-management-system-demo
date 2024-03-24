import './Footer.css'

export function Footer() {
  return (
    <footer>
      <p>
        <a href="/docs/swagger" target="_blank">
          API Documentation
        </a>
        <span> </span>(<a href="/docs/swagger-json" target="_blank">
          JSON
        </a>)
        ｜
        <a href="/docs/typeDoc" target="_blank">
          TypeDoc
        </a>
        ｜
        <a
          href="https://github.com/cocoychris/user-management-system-demo"
          target="_blank"
        >
          GitHub Repository
        </a>
      </p>
      <p>
        Developed by{' '}
        <a href="https://andrash.dev/page/about_andrash" target="_blank">Andrash Yang</a>
      </p>
    </footer>
  );
}
