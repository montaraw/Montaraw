export default function MontarawLogo({
  iconSize = 'w-10 h-10 md:w-12 md:h-12',
  textSize = 'text-xl md:text-2xl',
  className = '',
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon */}
      <img
        src="/logo.png"
        alt="Montaraw"
        className={`${iconSize} object-contain transition-transform duration-300 hover:scale-105`}
      />
      {/* Brand Name Text */}
      <span
        className={`font-black text-white ${textSize} uppercase tracking-wider select-none`}
      >
        MONTARAW
      </span>
    </div>
  );
}
