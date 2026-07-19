import AmourScratchGate from '../AmourScratchGate';

// ---------------- AMOUR — a flower heart guests scratch away petal by petal ----------------
// AmourScratchGate carries its own heavy bits (the scratch canvas logic and
// the heart.webp artwork) — wrapping it here means those only ever get
// downloaded by a guest whose invitation actually uses the amour template.
export default function GateAmour(props) {
  return <AmourScratchGate {...props} />;
}
