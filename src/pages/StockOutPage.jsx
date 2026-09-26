import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { LuArrowUpFromLine, LuTriangleAlert, LuScanLine } from "react-icons/lu";
import api from "../services/api";
import { fetchProducts } from "../store/slices/productSlice";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

// Restrict the scanner to 1D barcode symbologies used on retail packaging
// (EAN/UPC) instead of QR.
const barcodeFormats = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
];

const StockOutPage = () => {
  const dispatch = useDispatch();
  const { items: products } = useSelector((state) => state.products);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scanValue, setScanValue] = useState("");
  const quantityRef = useRef(null);

  const scannerRef = useRef(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const startScanner = () => {
    setShowScanner(true);
  };

  // Looks the scanned EAN up against the DB (not the in-memory product list)
  // so it stays correct even if the local product cache is stale.
  const lookupByEan = async (rawCode) => {
    const ean = rawCode.trim();
    if (!ean) return null;

    try {
      const { data } = await api.get(`/products/ean/${encodeURIComponent(ean)}`);
      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error(`No product found for barcode "${ean}"`);
      } else {
        toast.error("Failed to look up scanned barcode");
      }
      return null;
    }
  };

  // Mirrors StockInPage's lifecycle: start the camera only while
  // `showScanner` is true, and *always* run the cleanup below on unmount /
  // toggle-off, guarded by `isScanning`. The previous version created the
  // scanner directly from a button click with no matching cleanup effect,
  // so navigating away mid-scan left the camera stream open and could blank
  // the page on remount.
  useEffect(() => {
    if (!showScanner) return;

    let scanner;
    let isMounted = true;

    const start = async () => {
      try {
        scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: 250,
            formatsToSupport: barcodeFormats,
          },
          async (decodedText) => {
            if (!isMounted) return;
            setScanValue(decodedText);

            const match = await lookupByEan(decodedText);
            if (!isMounted) return;

            if (match) {
              setProductId(match._id);
              toast.success(`Scanned: ${match.name}`);
            }

            try {
              if (scanner.isScanning) {
                await scanner.stop();
              }
            } catch (err) {
              console.error("Error stopping scanner:", err);
            }

            if (isMounted) {
              setShowScanner(false);
              setTimeout(() => {
                quantityRef.current?.focus();
              }, 100);
            }
          },
          () => {
            // Ignore normal "no barcode in frame" scan errors
          },
        );
      } catch (error) {
        console.error("Barcode scanner error:", error);
        toast.error("Unable to access camera or start barcode scanner");
        if (isMounted) {
          setShowScanner(false);
        }
      }
    };

    start();

    return () => {
      isMounted = false;
      if (scanner) {
        try {
          if (scanner.isScanning) {
            scanner.stop().catch((err) => {
              console.error("Scanner cleanup error:", err);
            });
          }
        } catch (err) {
          console.error("Scanner cleanup error:", err);
        }
      }
      scannerRef.current = null;
    };
  }, [showScanner]);

  // Hardware barcode scanners act like a keyboard: they type the code then
  // send an Enter keystroke. Look the code up in the DB by EAN, same as the
  // camera scan path.
  const handleScan = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const code = scanValue.trim();
    if (!code) return;

    const match = await lookupByEan(code);
    setScanValue("");
    if (!match) return;

    setProductId(match._id);
    toast.success(`Scanned: ${match.name} (available: ${match.quantity})`);
    quantityRef.current?.focus();
  };

  const selected = products.find((p) => p._id === productId);
  const willBeLow =
    selected &&
    quantity &&
    selected.quantity - Number(quantity) <= selected.minimumStock;
  const exceedsAvailable = selected && Number(quantity) > selected.quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !quantity || Number(quantity) <= 0) {
      toast.error("Select a product and enter a valid quantity");
      return;
    }
    if (exceedsAvailable) {
      toast.error(`Only ${selected.quantity} units available`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/stock/out", {
        productId,
        quantity: Number(quantity),
        note,
      });
      toast.success(`Dispatched ${quantity} units of ${selected?.name}`);
      setQuantity("");
      setNote("");
      setScanValue("");
      dispatch(fetchProducts());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record stock out");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-text">Stock Out</h1>
        <p className="text-sm text-text-muted">Record outgoing inventory</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass animate-slide-up flex flex-col gap-4 rounded-xl p-6"
      >
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-muted">
            <LuScanLine size={14} />
            Scan barcode
          </label>
          <input
            type="text"
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            onKeyDown={handleScan}
            placeholder="Scan or type barcode (EAN), then press Enter"
            autoComplete="off"
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-mono text-sm text-text outline-none focus:border-emerald-500/60"
          />
          <button
            type="button"
            onClick={startScanner}
            className="mt-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm text-white"
          >
            📷 Scan Barcode
          </button>
          {showScanner && (
            <div
              id="qr-reader"
              className="mt-3 w-full overflow-hidden rounded-lg"
            />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            Product
          </label>
          <select
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
          >
            <option value="">Select a product...</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.sku}) — available: {p.quantity}
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-surface-2 p-3 text-xs">
            <div>
              <p className="text-text-muted">Pack Size</p>
              <p className="font-medium text-text">{selected.packSize || '—'}</p>
            </div>
            <div>
              <p className="text-text-muted">MRP</p>
              <p className="font-medium text-text">{selected.mrp != null ? `₹${selected.mrp}` : '—'}</p>
            </div>
            <div>
              <p className="text-text-muted">Expiry Date</p>
              <p className="font-medium text-text">
                {selected.expiryDate ? new Date(selected.expiryDate).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            Quantity to dispatch{" "}
            {selected && (
              <span className="text-text-muted/70">
                (available: {selected.quantity})
              </span>
            )}
          </label>
          <input
            ref={quantityRef}
            type="number"
            min={1}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
          />
        </div>

        {exceedsAvailable && (
          <p className="flex items-center gap-1.5 text-xs text-rose-400">
            <LuTriangleAlert size={14} />
            Exceeds available stock ({selected.quantity} units)
          </p>
        )}
        {!exceedsAvailable && willBeLow && (
          <p className="flex items-center gap-1.5 text-xs text-amber-400">
            <LuTriangleAlert size={14} />
            This will bring stock at or below the minimum (
            {selected.minimumStock} units)
          </p>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
            placeholder="e.g. Dispatched to Store #4"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || exceedsAvailable}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          <LuArrowUpFromLine size={16} />
          Record Stock Out
        </button>
      </form>
    </div>
  );
};

export default StockOutPage;
