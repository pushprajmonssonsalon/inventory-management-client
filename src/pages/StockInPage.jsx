import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { LuArrowDownToLine, LuUndo2 } from "react-icons/lu";
import api from "../services/api";
import { fetchProducts } from "../store/slices/productSlice";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { LuScanLine } from "react-icons/lu";

// Restrict the scanner to 1D barcode symbologies used on retail packaging
// (EAN/UPC) instead of QR, and skip the (heavier) QR detector entirely.
const barcodeFormats = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
];

const returnTypeOptions = [
  { value: "customer", label: "Customer return" },
  { value: "supplier", label: "Supplier return" },
  { value: "damaged", label: "Damaged / defective" },
];

const StockInPage = () => {
  const dispatch = useDispatch();
  const { items: products } = useSelector((state) => state.products);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 'stock_in' = a fresh purchase/restock. 'return' = stock coming back in
  // from a customer, a supplier, or as damaged goods - each of which needs
  // a reason and a reference (order/RMA/PO number) for traceability.
  const [transactionType, setTransactionType] = useState("stock_in");
  const [returnType, setReturnType] = useState("customer");
  const [referenceId, setReferenceId] = useState("");

  const scannerRef = useRef(null);
  const quantityRef = useRef(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanValue, setScanValue] = useState("");

  const isReturn = transactionType === "return";

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const selected = products.find((p) => p._id === productId);

  const resetForm = () => {
    setQuantity("");
    setNote("");
    setReferenceId("");
  };

  const startScanner = () => {
    setShowScanner(true);
  };

  useEffect(() => {
    if (!showScanner) return;

    let scanner;
    let isMounted = true;

    const startScanner = async () => {
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

            const ean = decodedText.trim();
            setScanValue(ean);

            let match;
            try {
              const { data } = await api.get(
                `/products/ean/${encodeURIComponent(ean)}`,
              );
              match = data;
            } catch (err) {
              if (!isMounted) return;
              if (err.response?.status === 404) {
                toast.error(`No product found for barcode "${ean}"`);
              } else {
                toast.error("Failed to look up scanned barcode");
              }
              return;
            }

            if (!isMounted) return;

            setProductId(match._id);
            toast.success(`Scanned: ${match.name}`);

            // Stop scanner only here
            try {
              if (scanner.isScanning) {
                await scanner.stop();
              }
            } catch (err) {
              console.error("Error stopping scanner:", err);
            }

            if (isMounted) {
              setShowScanner(false);

              // Focus quantity input after scanner closes
              setTimeout(() => {
                quantityRef.current?.focus();
              }, 100);
            }
          },
          (errorMessage) => {
            // Ignore normal scanning "no barcode in frame" errors
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

    startScanner();

    return () => {
      isMounted = false;

      // Don't blindly stop the scanner here.
      // Only clean it up if it is still actually scanning.
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
    // Scanning now resolves the product via a DB lookup (by EAN) instead of
    // matching the in-memory `products` list, so the effect no longer needs
    // to depend on `products` - re-running it whenever the product list
    // refetches (e.g. after a stock update) would otherwise restart the
    // camera mid-scan.
  }, [showScanner]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId || !quantity || Number(quantity) <= 0) {
      toast.error("Select a product and enter a valid quantity");
      return;
    }
    if (isReturn && !referenceId.trim()) {
      toast.error(
        "Enter a reference number for this return (order, RMA, or PO)",
      );
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/stock/in", {
        productId,
        quantity: Number(quantity),
        note,
        source: isReturn ? "return" : "purchase",
        ...(isReturn && { returnType, referenceId: referenceId.trim() }),
      });
      toast.success(
        isReturn
          ? `Logged return of ${quantity} units for ${selected?.name}`
          : `Added ${quantity} units to ${selected?.name}`,
      );
      resetForm();
      dispatch(fetchProducts());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record stock in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-text">Stock In</h1>
        <p className="text-sm text-text-muted">
          Record incoming inventory or a return
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass animate-slide-up flex flex-col gap-4 rounded-xl p-6"
      >
        {/* Transaction type toggle */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => setTransactionType("stock_in")}
              className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
                !isReturn
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <LuArrowDownToLine size={15} />
              New Stock
            </button>
            <button
              type="button"
              onClick={() => setTransactionType("return")}
              className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
                isReturn
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <LuUndo2 size={15} />
              Return
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={startScanner}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white"
        >
          <LuScanLine size={16} />
          Scan Barcode
        </button>

        {showScanner && (
          <div
            id="qr-reader"
            // (kept as "qr-reader" - it's just the DOM node id html5-qrcode mounts into)
            className="mt-3 w-full overflow-hidden rounded-lg"
          />
        )}
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
                {p.name} ({p.sku}) — current: {p.quantity}
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-surface-2 p-3 text-xs sm:grid-cols-3">
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
            Quantity to add
          </label>
          <input
            type="number"
            min={1}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
          />
        </div>

        {isReturn && (
          <div className="animate-fade-in flex flex-col gap-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">
                Return reason
              </label>
              <select
                value={returnType}
                onChange={(e) => setReturnType(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
              >
                {returnTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">
                Reference number
              </label>
              <input
                required={isReturn}
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="Order #, RMA #, or PO #"
                className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-mono text-sm text-text outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>
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
            placeholder={
              isReturn
                ? "e.g. Item returned unopened"
                : "e.g. Supplier restock, PO #1234"
            }
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {isReturn ? <LuUndo2 size={16} /> : <LuArrowDownToLine size={16} />}
          {isReturn ? "Record Return" : "Record Stock In"}
        </button>
      </form>
    </div>
  );
};

export default StockInPage;
