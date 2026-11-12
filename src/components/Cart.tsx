"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { money, type ID } from "@/lib/domain";
export type CartLine = {
  product: ID;
  title: string;
  price: number;
  type: string;
  quantity: number;
};
const Context = createContext<{
  items: CartLine[];
  ready: boolean;
  add: (line: Omit<CartLine, "quantity">) => void;
  change: (id: ID, delta: number) => void;
  open: () => void;
  clear: () => void;
} | null>(null);
export const useCart = () => {
  const context = useContext(Context);
  if (!context) throw new Error("Cart provider is missing.");
  return context;
};
export function CartProvider({
  children,
  userID,
}: {
  children: ReactNode;
  userID?: ID;
}) {
  const [items, setItems] = useState<CartLine[]>([]),
    [ready, setReady] = useState(false),
    [remoteReady, setRemoteReady] = useState(false),
    [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const dirty = useRef(false);
  const writes = useRef(Promise.resolve());
  const router = useRouter();
  const guestKey = "pans-basket-guest-v3";
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setReady(false);
    setRemoteReady(false);
    setItems([]);
    dirty.current = false;
    let local: CartLine[] = [];
    try {
      // The old cache mixed account and guest baskets and has no safe owner.
      localStorage.removeItem("pans-basket-v2");
      const saved = JSON.parse(localStorage.getItem(guestKey) || "[]");
      if (Array.isArray(saved))
        local = saved
          .filter(
            (x) =>
              x &&
              Number.isSafeInteger(x.product) &&
              x.product > 0 &&
              ["physical", "digital", "course"].includes(x.type) &&
              typeof x.title === "string" &&
              Number.isSafeInteger(x.quantity) &&
              x.quantity > 0 &&
              x.quantity <= 20 &&
              Number.isSafeInteger(x.price) &&
              x.price >= 0,
          )
          .slice(0, 40);
    } catch {}
    if (userID) {
      fetch("/api/basket", { cache: "no-store", signal: controller.signal })
        .then(async (response) => {
          if (response.status === 401) {
            router.refresh();
            throw new Error("Session changed");
          }
          if (!response.ok) throw new Error("Basket unavailable");
          const result = await response.json();
          if (result.owner !== userID) {
            router.refresh();
            throw new Error("Session changed");
          }
          // Merge only this browser's guest items, once, into the current account.
          if (local.length) {
            const merged = await fetch("/api/basket", {
              method: "POST",
              signal: controller.signal,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                owner: userID,
                mode: "merge",
                items: local.map(({ product, quantity }) => ({
                  product,
                  quantity,
                })),
              }),
            });
            if (!merged.ok) throw new Error("Basket merge failed");
            const data = await merged.json();
            if (!cancelled) localStorage.removeItem(guestKey);
            return data;
          }
          return result;
        })
        .then((result) => {
          if (cancelled) return;
          setItems(result.items || []);
          setRemoteReady(true);
          setReady(true);
        })
        .catch(() => {
          if (!cancelled)
            setNotice(
              "Your basket could not be loaded. Please refresh the page.",
            );
        });
    } else {
      setItems(local);
      setReady(true);
    }
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [userID, router]);
  useEffect(() => {
    if (ready && !userID)
      try {
        localStorage.setItem(guestKey, JSON.stringify(items));
      } catch {}
  }, [items, ready, userID]);
  useEffect(() => {
    if (!userID || !ready || !remoteReady || !dirty.current) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      writes.current = writes.current
        .catch(() => {})
        .then(() => {
          if (cancelled) return;
          return fetch("/api/basket", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              owner: userID,
              items: items.map(({ product, quantity }) => ({
                product,
                quantity,
              })),
            }),
          })
            .then((response) => {
              if (cancelled) return;
              if (response.status === 401 || response.status === 403) {
                setItems([]);
                setReady(false);
                router.refresh();
              } else if (response.ok) dirty.current = false;
              else
                setNotice("Your basket could not be saved. Please try again.");
            })
            .catch(() => {
              if (!cancelled)
                setNotice("Your basket could not be saved. Please try again.");
            });
        });
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [items, userID, ready, remoteReady, router]);
  useEffect(() => {
    let active = true,
      checking = false;
    const checkSession = async () => {
      if (document.visibilityState !== "visible" || checking) return;
      checking = true;
      try {
        const response = await fetch("/api/basket", { cache: "no-store" });
        const result = await response.json();
        if (!active || (!response.ok && response.status !== 401)) return;
        if ((result.owner ?? undefined) !== userID) {
          setItems([]);
          setReady(false);
          router.refresh();
        } else if (userID && !dirty.current && ready)
          setItems(result.items || []);
      } catch {
      } finally {
        checking = false;
      }
    };
    window.addEventListener("focus", checkSession);
    document.addEventListener("visibilitychange", checkSession);
    return () => {
      active = false;
      window.removeEventListener("focus", checkSession);
      document.removeEventListener("visibilitychange", checkSession);
    };
  }, [userID, ready, router]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);
  function add(line: Omit<CartLine, "quantity">) {
    if (!ready) return;
    dirty.current = true;
    setItems((current) => {
      const found = current.find(
        (x) => String(x.product) === String(line.product),
      );
      if (found)
        return current.map((x) =>
          x === found
            ? {
                ...line,
                quantity:
                  line.type === "physical"
                    ? Math.min(found.quantity + 1, 20)
                    : 1,
              }
            : x,
        );
      return [...current, { ...line, quantity: 1 }].slice(0, 40);
    });
    setNotice(line.title + " added to your basket.");
  }
  function change(id: ID, delta: number) {
    if (!ready) return;
    dirty.current = true;
    setItems((current) =>
      current.flatMap((x) => {
        if (String(x.product) !== String(id)) return [x];
        const quantity = x.quantity + delta;
        return quantity > 0
          ? [
              {
                ...x,
                quantity: x.type === "physical" ? Math.min(quantity, 20) : 1,
              },
            ]
          : [];
      }),
    );
  }
  return (
    <Context.Provider
      value={{
        items,
        ready,
        add,
        change,
        open: () => dialog.current?.showModal(),
        clear: () => {
          dirty.current = true;
          setItems([]);
        },
      }}
    >
      {children}
      <dialog
        ref={dialog}
        aria-labelledby="basketTitle"
        className="basket-dialog"
        onClick={(event) => {
          if (event.target === dialog.current) {
            const r = dialog.current!.getBoundingClientRect();
            if (
              event.clientX < r.left ||
              event.clientX > r.right ||
              event.clientY < r.top ||
              event.clientY > r.bottom
            )
              dialog.current!.close();
          }
        }}
      >
        <div className="dialog-head">
          <div>
            <div className="section-tag">Your next chapter</div>
            <h2 id="basketTitle">Your basket</h2>
          </div>
          <button
            className="text-button"
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
        <BasketItems />
        {items.length > 0 ? (
          <Link
            className="btn-primary full-width"
            href="/checkout"
            onClick={() => dialog.current?.close()}
          >
            Continue to checkout
          </Link>
        ) : (
          <Link
            className="btn-primary"
            href="/store"
            onClick={() => dialog.current?.close()}
          >
            Explore the store
          </Link>
        )}
      </dialog>
      <div role="status" className={"toast" + (notice ? " visible" : "")}>
        {notice}
      </div>
    </Context.Provider>
  );
}
export function BasketToggle() {
  const cart = useCart();
  return (
    <button
      className="basket-toggle"
      onClick={cart.open}
      disabled={!cart.ready}
      aria-haspopup="dialog"
    >
      Basket{" "}
      <span>{cart.items.reduce((sum, line) => sum + line.quantity, 0)}</span>
    </button>
  );
}
export function AddToBasket({
  product,
  label = "Add to basket",
  buyNow = false,
}: {
  product: { id: ID; title: string; price: number; type: string };
  label?: string;
  buyNow?: boolean;
}) {
  const cart = useCart();
  const router = useRouter();
  return (
    <button
      className="buy-btn-sm"
      disabled={!cart.ready}
      onClick={() => {
        cart.add({
          product: product.id,
          title: product.title,
          price: product.price,
          type: product.type,
        });
        if (buyNow) router.push("/checkout");
        else cart.open();
      }}
    >
      {label}
    </button>
  );
}
export function BasketItems() {
  const { items, change, ready } = useCart();
  if (!ready)
    return (
      <p className="empty-state" role="status">
        Loading your basket…
      </p>
    );
  return (
    <>
      {items.length === 0 ? (
        <p className="empty-state">
          Your next discovery is waiting. Explore the store to get started.
        </p>
      ) : (
        items.map((item) => (
          <div className="basket-row" key={item.product}>
            <div>
              <strong>{item.title}</strong>
              <small>
                {money(item.price)}
                {item.type === "physical" ? " each" : ""}
              </small>
            </div>
            <div className="quantity-controls">
              <button
                type="button"
                aria-label={"Remove one " + item.title}
                onClick={() => change(item.product, -1)}
              >
                −
              </button>
              <span>{item.quantity}</span>
              {item.type === "physical" && (
                <button
                  type="button"
                  aria-label={"Add one " + item.title}
                  disabled={item.quantity >= 20}
                  onClick={() => change(item.product, 1)}
                >
                  +
                </button>
              )}
            </div>
          </div>
        ))
      )}
      {items.length > 0 && (
        <div className="basket-total">
          <span>Total</span>
          <strong>
            {money(
              items.reduce((sum, line) => sum + line.price * line.quantity, 0),
            )}
          </strong>
        </div>
      )}
    </>
  );
}
export function Checkout({
  signedIn,
  paymentsReady,
}: {
  signedIn: boolean;
  paymentsReady: boolean;
}) {
  const { items } = useCart();
  const paymentUnavailable =
    !paymentsReady && items.some((item) => item.price > 0);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  return (
    <div className="surface">
      <BasketItems />
      {paymentUnavailable && (
        <p className="form-feedback" role="status">
          Online payment is not available yet. Your basket is saved; you can
          return when payments open.
        </p>
      )}
      {message && (
        <p className="form-feedback error" role="alert">
          {message}
        </p>
      )}
      {items.length > 0 &&
        (signedIn ? (
          <>
            <p className="form-note">
              Your order total and availability are checked before payment.
              Physical items are collected on campus.
            </p>
            <button
              className="btn-primary full-width"
              disabled={busy || paymentUnavailable}
              onClick={async () => {
                setBusy(true);
                setMessage("");
                try {
                  const response = await fetch("/api/hub/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      items: items.map(({ product, quantity }) => ({
                        product,
                        quantity,
                      })),
                    }),
                  });
                  const data = await response.json();
                  if (!response.ok)
                    throw new Error(
                      data.message || "We could not start checkout.",
                    );
                  window.location.assign(data.redirect);
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "Please try again.",
                  );
                  setBusy(false);
                }
              }}
            >
              {busy
                ? "Preparing your order…"
                : paymentUnavailable
                  ? "Payments opening soon"
                  : "Place order"}
            </button>
          </>
        ) : (
          <>
            <p className="form-note">
              Sign in to keep your purchases and course access together. Your
              basket will be waiting.
            </p>
            <Link
              className="btn-primary full-width"
              href="/sign-in?next=%2Fcheckout"
            >
              Sign in to continue
            </Link>
          </>
        ))}
      <Link className="quiet-link" href="/store">
        Continue exploring
      </Link>
    </div>
  );
}
export function ClearBasket() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, []);
  return null;
}
