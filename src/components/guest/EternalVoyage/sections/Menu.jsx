import useScrollReveal from './lib/useScrollReveal';
import { firstText } from './lib/builderData';

/**
 * `data.menu` has been seen in a few shapes across invitations: a flat
 * array of dishes, a flat array where each dish carries its own
 * `category`, an object of `{ categoryName: [items] }`, and an object
 * with a `categories: [{ name, items }]` list. All are normalized here
 * into `[{ title, items }]` so the card grid below stays single-purpose.
 */
function resolveMenuItem(item) {
  if (!item) return null;

  if (typeof item === 'string') {
    const name = firstText(item);
    return name ? { name, description: '', price: '', image: '' } : null;
  }

  if (typeof item !== 'object') return null;

  const name = firstText(item.name, item.title, item.dish);
  if (!name) return null;

  return {
    name,
    description: firstText(item.description, item.details, item.desc),
    price: firstText(item.price, item.cost),
    image: firstText(item.image, item.photo, item.img),
  };
}

function resolveMenuGroups(data) {
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
        const title = firstText(item.category, item.course) || 'Menu';
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

function MenuCard({ item, index }) {
  const [ref, visible] = useScrollReveal();

  return (
    <article
      ref={ref}
      className={`ev-menu__card ev-reveal ${visible ? 'ev-reveal--visible' : ''}`}
      style={{ transitionDelay: visible ? `${Math.min(index, 6) * 70}ms` : '0ms' }}
    >
      {item.image && (
        <div className="ev-menu__card-image">
          <img src={item.image} alt={item.name} loading="lazy" />
        </div>
      )}
      <div className="ev-menu__card-body">
        <div className="ev-menu__card-head">
          <h4 className="ev-menu__card-name">{item.name}</h4>
          {item.price && <span className="ev-menu__card-price">{item.price}</span>}
        </div>
        {item.description && <p className="ev-menu__card-desc">{item.description}</p>}
      </div>
    </article>
  );
}

export default function Menu({ data }) {
  const groups = resolveMenuGroups(data);
  if (!groups.length) return null;

  return (
    <section className="ev-menu" id="menu" data-section="menu">
      <h2 className="ev-menu__heading">Menu</h2>
      {groups.map((group, groupIndex) => (
        <div className="ev-menu__group" key={group.title || groupIndex}>
          {group.title && <h3 className="ev-menu__category">{group.title}</h3>}
          <div className="ev-menu__grid">
            {group.items.map((item, itemIndex) => (
              <MenuCard key={`${item.name}-${itemIndex}`} item={item} index={itemIndex} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
