// Bloom — клиентская логика (фронтенд без бэкенда)
const FLOWER_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#FBE9EE"/>' +
  '<g transform="translate(200 250)" fill="#E8A3B5">' +
  [0, 60, 120, 180, 240, 300].map(a => `<ellipse rx="38" ry="75" cy="-70" transform="rotate(${a})"/>`).join('') +
  '</g><circle cx="200" cy="250" r="30" fill="#8E1F4A"/></svg>');

function imgFallback(img) {
  if (!img.dataset.tried) {
    img.dataset.tried = '1';
    img.src = 'https://loremflickr.com/800/1000/' + (img.dataset.kw || 'flowers');
  } else { img.onerror = null; img.src = FLOWER_SVG; }
}

// ---------- Локальные данные (вместо базы данных) ----------
const KW = { roses: 'rose,bouquet', spring: 'tulip,flowers', premium: 'peony,bouquet' };
let cart = [], filter = 'all';

// Красивые стоковые картинки с Unsplash
const products = [
  { id: 1, name: 'Букет "Розовое утро"', category: 'roses', price: 2500, description: 'Нежные розы с пионами и зеленью.', image_url: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=600&q=80' },
  { id: 2, name: 'Классические розы', category: 'roses', price: 3200, description: '15 бархатных красных роз.', image_url: 'https://images.unsplash.com/photo-1548586196-aa5854a6d114?w=600&q=80' },
  { id: 3, name: 'Весенний микс', category: 'spring', price: 1800, description: 'Тюльпаны, нарциссы и веточки вербы.', image_url: 'https://images.unsplash.com/photo-1490750967868-88cb4ecb07cb?w=600&q=80' },
  { id: 4, name: 'Пионовый рай', category: 'premium', price: 4500, description: 'Пышные пионы в авторской упаковке.', image_url: 'https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=600&q=80' },
  { id: 5, name: 'Солнечный день', category: 'spring', price: 2100, description: 'Яркие герберы и хризантемы.', image_url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&q=80' },
  { id: 6, name: 'Премиум "Шёлк"', category: 'premium', price: 5900, description: 'Экзотические цветы и орхидеи.', image_url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&q=80' }
];

// ---------- Вспомогательные ----------
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = (n) => n.toLocaleString('ru-RU') + ' сом';
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.style.opacity = 1;
  clearTimeout(toast.id); toast.id = setTimeout(() => t.style.opacity = 0, 2500);
}

// ---------- Каталог ----------
function renderProducts() {
  const list = products.filter(p => filter === 'all' || p.category === filter);
  $('#products').innerHTML = list.map((p, i) => `
    <article class="card rise bg-white rounded-3xl overflow-hidden border border-bud/40 shadow-sm flex flex-col" style="--i:${i}">
      <div class="overflow-hidden aspect-[4/3] bg-petal">
        <img src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy" class="w-full h-full object-cover"
             data-kw="${KW[p.category] || 'flowers'}" onerror="imgFallback(this)">
      </div>
      <div class="p-6 flex flex-col flex-1">
        <h3 class="font-display text-xl mb-1">${esc(p.name)}</h3>
        <p class="text-sm text-ink/60 mb-4 flex-1">${esc(p.description || '')}</p>
        <div class="flex items-center justify-between">
          <span class="font-bold text-berry text-lg">${money(p.price)}</span>
          <button data-add="${p.id}" class="px-5 py-2.5 bg-petal text-berry font-bold rounded-full hover:bg-berry hover:text-white transition">В корзину</button>
        </div>
      </div>
    </article>`).join('') || '<p class="text-ink/60">В этой категории пока пусто.</p>';
}

$('#filters').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip'); if (!btn) return;
  filter = btn.dataset.cat;
  document.querySelectorAll('.chip').forEach(b => b.classList.toggle('active', b === btn));
  renderProducts();
});
$('#products').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-add]'); if (btn) addToCart(+btn.dataset.add);
});

// ---------- Корзина ----------
function saveCart() { try { localStorage.setItem('bloom-cart', JSON.stringify(cart)); } catch {} }
function loadCart() { try { cart = JSON.parse(localStorage.getItem('bloom-cart')) || []; } catch { cart = []; } }

function addToCart(id) {
  const p = products.find(x => x.id === id); if (!p) return;
  const item = cart.find(i => i.id === id);
  item ? item.qty++ : cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
  updateCart(); toast(`«${p.name}» в корзине`);
  const c = $('#cart-count'); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
}
function changeQty(id, d) {
  const item = cart.find(i => i.id === id); if (!item) return;
  item.qty += d; if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCart();
}
const total = () => cart.reduce((s, i) => s + i.price * i.qty, 0);

function updateCart() {
  saveCart();
  $('#cart-count').textContent = cart.reduce((s, i) => s + i.qty, 0);
  $('#cart-total').textContent = money(total());
  $('#cart-items').innerHTML = cart.length ? cart.map(i => `
    <div class="flex justify-between items-center gap-3 pb-4 border-b border-ink/10">
      <div><div class="font-bold">${esc(i.name)}</div><div class="text-sm text-ink/60">${money(i.price)}</div></div>
      <div class="flex items-center gap-3">
        <button data-qty="${i.id}" data-d="-1" class="w-8 h-8 rounded-full bg-petal hover:bg-bud transition" aria-label="Меньше">−</button>
        <span class="w-4 text-center font-bold">${i.qty}</span>
        <button data-qty="${i.id}" data-d="1" class="w-8 h-8 rounded-full bg-petal hover:bg-bud transition" aria-label="Больше">+</button>
      </div>
    </div>`).join('') : '<p class="text-ink/50 text-center mt-10">Корзина пуста. Выберите букет в каталоге.</p>';
  $('#summary').innerHTML = cart.length
    ? cart.map(i => `<div class="flex justify-between"><span>${esc(i.name)} × ${i.qty}</span><span>${money(i.price * i.qty)}</span></div>`).join('') +
      `<div class="flex justify-between font-bold pt-3 mt-3 border-t border-bud"><span>Итого</span><span class="text-berry">${money(total())}</span></div>`
    : '<p class="text-ink/60">Пока ничего не выбрано.</p>';
}
$('#cart-items').addEventListener('click', (e) => {
  const b = e.target.closest('[data-qty]'); if (b) changeQty(+b.dataset.qty, +b.dataset.d);
});

function toggleCart(open) {
  $('#drawer').classList.toggle('translate-x-full', !open);
  $('#overlay').classList.toggle('hidden', !open);
}
$('#cart-btn').onclick = () => toggleCart(true);
$('#close-cart').onclick = $('#overlay').onclick = $('#checkout').onclick = () => toggleCart(false);
document.addEventListener('keydown', (e) => e.key === 'Escape' && toggleCart(false));

// ---------- Оформление заказа ----------
$('#order-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!cart.length) { toast('Сначала добавьте букет в корзину'); return $('#catalog').scrollIntoView(); }
  
  const f = new FormData(e.target), btn = $('#submit-btn');
  btn.disabled = true; btn.textContent = 'Отправляем…';
  
  // Имитация отправки
  setTimeout(() => {
    const orderId = Math.floor(Math.random() * 9000) + 1000;
    
    // Очищаем корзину и форму
    cart = []; updateCart(); e.target.reset();
    btn.disabled = false; btn.textContent = 'Отправить заказ';
    
    // Показываем красивую модалку
    const modal = document.getElementById('success-modal');
    if (modal) {
      document.getElementById('order-number').textContent = orderId;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }, 800);
});

// Закрытие модалки
document.addEventListener('click', (e) => {
  if (e.target.id === 'close-modal' || e.target.id === 'success-modal') {
    const modal = document.getElementById('success-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
});

// ---------- Старт ----------
loadCart(); updateCart();
renderProducts();