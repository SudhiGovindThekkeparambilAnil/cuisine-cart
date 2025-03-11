type PageTitleProps = {
    text: string;
    className?: string;
  };
  
  export default function Title({ text, className = "" }: PageTitleProps) {
    return <h2 className={`text-black text-2xl font-semibold ${className}`}>{text}</h2>;
  }
  