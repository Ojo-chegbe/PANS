"use client";
import { useState } from "react";
import Link from "next/link";
import { AddToBasket } from "./Cart";
import { MediaImage } from "./MediaImage";
import { mediaURL } from "@/lib/media";
import { money, type RecordData } from "@/lib/domain";
export function ProductCard({ product }: { product: RecordData }) {
  const className = product.type === "physical" ? "detergent" : "course";
  const unavailable =
    product.type === "physical" && !(product.stock > 0)
      ? "Out of stock"
      : product.salesOpen === false ||
          (product.type === "digital" && !product.file) ||
          (product.type === "course" && !product.course)
        ? product.type === "course"
          ? "Enrolment opens soon"
          : "Available soon"
        : "";
  return (
    <article className={className + "-card"}>
      {mediaURL(product.image) && (
        <Link
          href={"/store/" + product.slug}
          className={className + "-art has-photo"}
          tabIndex={-1}
          aria-hidden="true"
        >
          <MediaImage
            image={product.image}
            alt={product.image?.alt || ""}
            loading="lazy"
          />
        </Link>
      )}
      <div className={className + "-body"}>
        {product.type === "physical" && (
          <span className="detergent-tag">{product.category}</span>
        )}
        <h4>
          <Link href={"/store/" + product.slug}>{product.title}</Link>
        </h4>
        <p>{product.description}</p>
        <div className="course-foot">
          <span className="price">
            {product.price === 0 ? "Free" : money(product.price)}
          </span>
          {unavailable ? (
            <button type="button" className="buy-btn-sm" disabled>
              {unavailable}
            </button>
          ) : (
            <AddToBasket
              product={{
                id: product.id,
                title: product.title,
                price: product.price,
                type: product.type,
              }}
            />
          )}
        </div>
        <div className="product-availability">
          <span>{unavailable || "Available to order"}</span>
          <Link href={"/store/" + product.slug}>View details</Link>
        </div>
      </div>
    </article>
  );
}
export function Catalog({
  products,
  promos = [],
  filters = true,
}: {
  products: RecordData[];
  promos?: any[];
  filters?: boolean;
}) {
  const [category, setCategory] = useState("all");
  const filtered = products.filter(
    (product) => category === "all" || product.type === category,
  );
  const groups = [
    {
      key: "course",
      title: "Courses",
      description: "Built around real, in-demand skills",
    },
    {
      key: "physical",
      title: "Detergents",
      description: "PANS-branded, staff-guided quality checks",
    },
    {
      key: "digital",
      title: "Digital resources",
      description: "Practical resources for your next step",
    },
  ];
  return (
    <>
      {filters && (
        <div className="store-controls">
          <div className="filters" role="group" aria-label="Product categories">
            {[
              ["all", "All products"],
              ["course", "Courses"],
              ["physical", "Essentials"],
              ["digital", "Digital resources"],
            ].map(([key, label]) => (
              <button
                className={"filter" + (key === category ? " active" : "")}
                key={key}
                onClick={() => setCategory(key)}
                aria-pressed={key === category}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      {groups.map((group) => {
        const items = filtered.filter((product) => product.type === group.key);
        if (!items.length) return null;
        return (
          <div key={group.key}>
            <div className="store-subhead">
              <h3>{group.title}</h3>
              <span>{group.description}</span>
            </div>
            <div
              className={
                group.key === "physical" ? "detergent-grid" : "course-grid"
              }
            >
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        );
      })}
      {promos.length > 0 && (category === "all" || category === "digital") && (
        <>
          <div className="store-subhead">
            <h3>More from the store</h3>
            <span>E-books &amp; design templates</span>
          </div>
          <div className="store-grid">
            {promos.map((promo) => (
              <article className="product-card" key={promo.title}>
                <div className="top-rule" />
                <h3>{promo.title}</h3>
                <p>{promo.description}</p>
                <div className="product-foot">
                  <span className="price">{promo.priceLabel}</span>
                  <Link className="buy-btn" href={promo.url}>
                    Explore
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      {filtered.length === 0 &&
        !(promos.length && (category === "all" || category === "digital")) && (
          <p className="empty-state">
            There are no products in this category yet. Please check back soon.
          </p>
        )}
    </>
  );
}
