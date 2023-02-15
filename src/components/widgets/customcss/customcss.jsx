export default function Customcss({ options }) {
  if (options.src) {
    return (
      <link href={options.src} type="text/css" rel="stylesheet"></link>
    );
  }
}
