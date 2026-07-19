import { guestCopy } from '../../../../lib/guestCopy';
import useScrollReveal from '../hooks/useScrollReveal';

function firstText(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return '';
}

function resolveMenuItem(item) {
  if (!item) return null;

  if (typeof item === 'string') {
    const name = firstText(item);
    return name ? { name, description: '', price: '' } : null;
  }

  if (typeof item !== 'object') return null;

  const name = firstText(item.name, item.title, item.dish);
  if (!name) return null;

  return {
    name,
    description: firstText(item.description, item.details, item.desc),
    price: firstText(item.price, item.cost),
  };
}

function resolveMenuGroups(data, defaultCategory) {
  const menu = data?.menu;
  if (!menu) return [];

  if (Array.isArray(menu)) {
    const hasCategories = menu.some(
      (item) => item && typeof item === 'object' && firstText(item.category, item.course)
    );

    if (hasCategories) {
      const order = [];
      const grouped = new Map();
      menu.forEach((item) => {
        if (!item || typeof item !== 'object') return;
        const title = firstText(item.category, item.course) || defaultCategory;
        const resolved = resolveMenuItem(item);
        if (!resolved) return;
        if (!grouped.has(title)) {
          grouped.set(title, []);
          order.push(title);
        }
        grouped.get(title).push(resolved);
      });
      return order.map((title) => ({ title, items: grouped.get(title) }));
    }

    const items = menu.map(resolveMenuItem).filter(Boolean);
    return items.length ? [{ title: '', items }] : [];
  }

  if (typeof menu === 'object') {
    if (Array.isArray(menu.categories)) {
      return menu.categories
        .map((category) => {
          if (!category) return null;
          const title = firstText(category.name, category.title, category.category);
          const items = (Array.isArray(category.items) ? category.items : [])
            .map(resolveMenuItem)
            .filter(Boolean);
          return items.length ? { title, items } : null;
        })
        .filter(Boolean);
    }

    return Object.entries(menu)
      .filter(([, value]) => Array.isArray(value))
      .map(([title, arr]) => {
        const items = arr.map(resolveMenuItem).filter(Boolean);
        return items.length ? { title, items } : null;
      })
      .filter(Boolean);
  }

  return [];
}

function MenuDish({ item, index }) {
  const [ref, visible] = useScrollReveal({ threshold: 0.12 });

  return (
    <li
      ref={ref}
      className={`gp-menu__dish gp-reveal ${visible ? 'gp-reveal--visible' : ''}`}
      style={{ transitionDelay: visible ? `${Math.min(index, 5) * 60}ms` : '0ms' }}
    >
      <div className="gp-menu__dish-head">
        <h4 className="gp-menu__dish-name">{item.name}</h4>
        {item.price && <span className="gp-menu__dish-price">{item.price}</span>}
      </div>
      {item.description && <p className="gp-menu__dish-desc">{item.description}</p>}
    </li>
  );
}

export default function Menu({ data }) {
  const copy = guestCopy(data?.language).menu;
  const groups = resolveMenuGroups(data, copy.defaultCategory);
  const [frameRef, frameVisible] = useScrollReveal();

  if (!groups.length) return null;

  const isArabic = data?.language === 'ar';

  return (
    <section
      className="gp-menu"
      id="menu"
      data-section="menu"
      dir={isArabic ? 'rtl' : 'ltr'}
      aria-label={copy.title}
    >
      <div className="gp-menu__atmosphere" aria-hidden="true" />

      <div
        ref={frameRef}
        className={`gp-menu__frame gp-reveal ${frameVisible ? 'gp-reveal--visible' : ''}`}
      >
        <span className="gp-menu__kicker">{copy.kicker}</span>
        <span className="gp-menu__rule gp-menu__rule--top" aria-hidden="true" />
        <h2 className="gp-menu__title">{copy.title}</h2>

        {groups.map((group, groupIndex) => (
          <div className="gp-menu__group" key={group.title || groupIndex}>
            {group.title && <h3 className="gp-menu__category">{group.title}</h3>}
            <ul className="gp-menu__list">
              {group.items.map((item, itemIndex) => (
                <MenuDish key={`${item.name}-${itemIndex}`} item={item} index={itemIndex} />
              ))}
            </ul>
          </div>
        ))}

        <span className="gp-menu__rule gp-menu__rule--bottom" aria-hidden="true" />
      </div>
    </section>
  );
}
