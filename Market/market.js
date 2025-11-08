import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { ref, set, getDatabase, push, onValue, get, update } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import { onAuthStateChanged, getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBsOwXNtfaWwEh3qaM0suXafOg6CYLzDC8",
  authDomain: "uamtv-c031c.firebaseapp.com",
  databaseURL: "https://uamtv-c031c-default-rtdb.firebaseio.com",
  projectId: "uamtv-c031c",
  storageBucket: "uamtv-c031c.firebasestorage.app",
  messagingSenderId: "9790917697",
  appId: "1:9790917697:web:275c8347b7688e0ac38ac0",
  measurementId: "G-RSXW1XBVQZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase();

console.log('🔥 Firebase initialized:', app.name);

const categoryTrigger = document.getElementById('categoryTrigger');
const categoryDropdown = document.getElementById('categoryDropdown');
const categoryOptions = document.querySelectorAll('.select-option-filter');

categoryTrigger.addEventListener('click', function(e) {
    e.stopPropagation();
    categoryTrigger.classList.toggle('active');
    categoryDropdown.classList.toggle('active');
});

document.addEventListener('click', function(e) {
    if (!categoryTrigger.contains(e.target) && !categoryDropdown.contains(e.target)) {
        categoryTrigger.classList.remove('active');
        categoryDropdown.classList.remove('active');
    }
});

categoryOptions.forEach(option => {
    option.addEventListener('click', async function() {
        categoryOptions.forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        const selectedCategory = this.getAttribute('data-value');
        const optionHTML = this.querySelector('.option-content-filter').innerHTML;
        categoryTrigger.innerHTML = `
            <div class="selected-value">${optionHTML}</div>
            <div class="select-arrow-filter"></div>
        `;
        categoryTrigger.classList.remove('active');
        categoryDropdown.classList.remove('active');
        console.log(`🔍 Filtering by category: ${selectedCategory}`);
        clearSkeletonLoading();
        showSkeletonLoading();
        setTimeout(async () => {
            await renderTools(selectedCategory);
        }, 300);
    });
});

const marketContainer = document.getElementById("marketContainer");
const categoryFilter = document.getElementById("categoryFilter");

let currentUserId = null;
let currentUserBalance = 0;
let allToolsData = [];

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
    console.log('✅ User logged in:', user.uid);
    const userRef = ref(db, `users/${user.uid}`);
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        currentUserBalance = snapshot.val().tokens || 0;
        console.log('💰 Current balance:', currentUserBalance);
      }
    });
  } else {
    currentUserId = null;
    console.log('⚠️ No user logged in');
  }
});

function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

function createSkeletonCard() {
  const skeleton = document.createElement('div');
  skeleton.className = 'skeleton-card';
  skeleton.style.cssText = `background: #111; border: 1px solid #00ff7f33; border-radius: 12px; overflow: hidden; height: 100%; margin: 12px; animation: pulse 1.5s ease-in-out infinite;`;
  skeleton.innerHTML = `<div class="skeleton-img" style="width: 100%; height: 200px; background: linear-gradient(90deg, #0a0a0a 25%, #1a1a1a 50%, #0a0a0a 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div><div style="padding: 16px;"><div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><div class="skeleton-line" style="width: 60%; height: 20px; background: linear-gradient(90deg, #0a0a0a 25%, #1a1a1a 50%, #0a0a0a 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px;"></div><div class="skeleton-line" style="width: 25%; height: 20px; background: linear-gradient(90deg, #0a0a0a 25%, #1a1a1a 50%, #0a0a0a 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px;"></div></div><div class="skeleton-line" style="width: 100%; height: 35px; margin-bottom: 12px; background: linear-gradient(90deg, #0a0a0a 25%, #1a1a1a 50%, #0a0a0a 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px;"></div><div class="skeleton-line" style="width: 100%; height: 50px; margin-bottom: 10px; background: linear-gradient(90deg, #0a0a0a 25%, #1a1a1a 50%, #0a0a0a 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px;"></div></div>`;
  return skeleton;
}

const style = document.createElement('style');
style.textContent = `@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } } @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);

function showSkeletonLoading() {
  marketContainer.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    marketContainer.appendChild(createSkeletonCard());
  }
}

function clearSkeletonLoading() {
  marketContainer.innerHTML = '';
}

async function hasUserPurchased(userId, toolId) {
  if (!userId) return false;
  try {
    const purchaseRef = ref(db, `users/${userId}/purchasedTools/${toolId}`);
    const snapshot = await get(purchaseRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking purchase:', error);
    return false;
  }
}

async function connectWithSeller(sellerId, sellerName) {
  if (!currentUserId) {
    alert('⚠️ Please login to connect with sellers!');
    return;
  }
  if (currentUserId === sellerId) {
    alert('❌ This is your own tool!');
    return;
  }
  const confirmConnect = confirm(`Connect with ${sellerName}?\n\nThis will open a chat or send a connection request.`);
  if (confirmConnect) {
    try {
      const connectionRef = ref(db, `connections/${currentUserId}/${sellerId}`);
      await set(connectionRef, {
        connectedAt: Date.now(),
        sellerName: sellerName,
        status: 'pending'
      });
      alert(`✅ Connection request sent to ${sellerName}!`);
    } catch (error) {
      console.error('Connection error:', error);
      alert('❌ Failed to connect: ' + error.message);
    }
  }
}

async function purchaseTool(toolId, toolPrice, sellerId, toolName) {
  if (!currentUserId) {
    alert('⚠️ Please login to purchase tools!');
    return false;
  }
  if (currentUserId === sellerId) {
    alert('❌ You cannot purchase your own tool!');
    return false;
  }
  try {
    const purchaseCheckRef = ref(db, `users/${currentUserId}/purchasedTools/${toolId}`);
    const purchaseSnapshot = await get(purchaseCheckRef);
    if (purchaseSnapshot.exists()) {
      alert('✅ You already own this tool!');
      return false;
    }
    const buyerRef = ref(db, `users/${currentUserId}`);
    const buyerSnapshot = await get(buyerRef);
    if (!buyerSnapshot.exists()) {
      alert('❌ User data not found!');
      return false;
    }
    const buyerBalance = buyerSnapshot.val().tokens || 0;
    if (buyerBalance < toolPrice) {
      alert(`❌ Insufficient balance!\n\nRequired: ${toolPrice} tokens\nYour balance: ${buyerBalance} tokens\nShortfall: ${toolPrice - buyerBalance} tokens`);
      return false;
    }
    const sellerRef = ref(db, `users/${sellerId}`);
    const sellerSnapshot = await get(sellerRef);
    if (!sellerSnapshot.exists()) {
      alert('❌ Seller data not found!');
      return false;
    }
    const sellerBalance = sellerSnapshot.val().tokens || 0;
    const newBuyerBalance = buyerBalance - toolPrice;
    const newSellerBalance = sellerBalance + toolPrice;
    const transactionId = push(ref(db, 'transactions')).key;
    const timestamp = Date.now();
    const transactionData = {
      transactionId: transactionId,
      type: 'purchase',
      toolId: toolId,
      toolName: toolName,
      amount: toolPrice,
      buyerId: currentUserId,
      sellerId: sellerId,
      timestamp: timestamp,
      status: 'completed'
    };
    const updates = {};
    updates[`users/${currentUserId}/tokens`] = newBuyerBalance;
    updates[`users/${currentUserId}/purchasedTools/${toolId}`] = {
      purchasedAt: timestamp,
      price: toolPrice,
      sellerId: sellerId,
      toolName: toolName
    };
    updates[`users/${sellerId}/tokens`] = newSellerBalance;
    updates[`users/${sellerId}/sales/${transactionId}`] = {
      toolId: toolId,
      toolName: toolName,
      buyerId: currentUserId,
      amount: toolPrice,
      timestamp: timestamp
    };
    updates[`users/${currentUserId}/transactions/${transactionId}`] = transactionData;
    updates[`users/${sellerId}/transactions/${transactionId}`] = transactionData;
    updates[`transactions/${transactionId}`] = transactionData;
    await update(ref(db), updates);
    console.log('✅ Purchase successful!');
    alert(`✅ Purchase Successful!\n\n🎉 You now own "${toolName}"!\n💸 Paid: ${toolPrice} tokens\n💰 New balance: ${newBuyerBalance} tokens`);
    return true;
  } catch (error) {
    console.error('❌ Purchase failed:', error);
    alert('❌ Purchase failed: ' + error.message);
    return false;
  }
}

async function renderTools(filterCategory = 'all') {
  clearSkeletonLoading();
  const toolsToDisplay = filterCategory === 'all' ? allToolsData : allToolsData.filter(tool => tool.category === filterCategory);
  if (toolsToDisplay.length === 0) {
    marketContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #888;"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 20px; opacity: 0.3;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><h3 style="color: #666; margin-bottom: 10px;">No tools found</h3><p>No tools available in this category yet.</p></div>`;
    return;
  }
  for (const tool of toolsToDisplay) {
    await createToolCard(tool);
  }
}

async function createToolCard(tool) {
  const tool_name = tool.name;
  const tool_description = tool.description;
  const tool_price = tool.price;
  const tool_image = tool.image;
  const tool_id = tool.toolId;
  const sellerId = tool.sellerId;
  const usage = tool.tool_usage;
  const tool_category = tool.category || 'developer';
  const download_link = tool.downloadUrl || '';
  const uploaderName = tool.uploaderName || 'Anonymous';
  const uploaderAvatar = tool.uploaderAvatar || tool_image;
  const uploadedAt = tool.uploadedAt || Date.now();
  const timeAgo = getTimeAgo(uploadedAt);
  const downloadCount = tool.downloadCount || 0;
  const isPurchased = await hasUserPurchased(currentUserId, tool_id);
  
  const card2 = document.createElement('div');
  const product_img_wrapper = document.createElement("div");
  const product_img = document.createElement("img");
  product_img.src = tool_image;
  const product_info = document.createElement("div");
  const product_header = document.createElement("div");
  const product_title = document.createElement("div");
  const h3 = document.createElement("h3");
  h3.textContent = tool_name;
  const price = document.createElement("span");
  price.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #00ff9c;"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="12" y1="2" x2="12" y2="6"/></svg>${tool_price}`;
  price.style.display = 'flex';
  price.style.alignItems = 'center';
  price.style.gap = '4px';
  const product_id = document.createElement("div");
  const id = document.createElement("span");
  id.textContent = tool_id;
  const copy_icon = document.createElement("span");
  copy_icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2"/><path d="M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"/></g></svg>';
  copy_icon.addEventListener("click", () => {
    navigator.clipboard.writeText(tool_id);
    copy_icon.textContent = 'copied';
    setTimeout(() => {
      copy_icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2"/><path d="M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"/></g></svg>';
    }, 1000);
  });
  const user_info = document.createElement("div");
  const user_avatar = document.createElement("img");
  user_avatar.src = uploaderAvatar;
  user_avatar.style.width = "32px";
  user_avatar.style.height = "32px";
  user_avatar.style.borderRadius = "50%";
  user_avatar.style.objectFit = "cover";
  user_avatar.style.border = "2px solid #00ff7f33";
  user_avatar.onerror = () => { user_avatar.src = tool_image; };
  const user_name = document.createElement("span");
  user_name.textContent = uploaderName;
  user_name.style.color = "#fff";
  user_name.style.fontSize = "0.9rem";
  user_name.style.fontWeight = "500";
  const time_label = document.createElement("span");
  time_label.textContent = timeAgo;
  time_label.style.color = "#888";
  time_label.style.fontSize = "0.8rem";
  const download_info = document.createElement("div");
  download_info.style.cssText = `display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: #0a0a0a; border-radius: 4px; border: 1px solid #00ff7f22; font-size: 0.85rem; color: #888;`;
  const downloadCountSpan = document.createElement("span");
  downloadCountSpan.style.cssText = "color: #00ff7f; font-weight: 600;";
  downloadCountSpan.textContent = downloadCount.toLocaleString();
  const downloadTextSpan = document.createElement("span");
  downloadTextSpan.textContent = `download${downloadCount !== 1 ? 's' : ''}`;
  download_info.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff7f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
  download_info.appendChild(downloadCountSpan);
  download_info.appendChild(downloadTextSpan);
  const button_group_top = document.createElement("div");
  const btn_unlock = document.createElement("button");
  const btn_info = document.createElement("button");
  const btn_download = document.createElement("button");
  btn_unlock.textContent = "Unlock";
  btn_info.textContent = "Info";
  const info_popup = document.createElement("div");
  info_popup.style.cssText = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(135deg, #1a1a1a, #0a0a0a); border: 2px solid #00ff7f; border-radius: 12px; padding: 20px; max-width: 90%; width: 400px; z-index: 1000; box-shadow: 0 0 30px rgba(0, 255, 127, 0.4); display: none; animation: slideIn 0.3s ease;`;
  const info_header = document.createElement("div");
  info_header.style.cssText = `display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #00ff7f33; padding-bottom: 10px;`;
  const info_title = document.createElement("h4");
  info_title.textContent = tool_name;
  info_title.style.cssText = `color: #00ff9c; margin: 0; font-size: 1.1em;`;
  const close_btn = document.createElement("button");
  close_btn.textContent = "✕";
  close_btn.style.cssText = `background: transparent; border: 1px solid #00ff7f44; color: #00ff7f; font-size: 1.2em; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; transition: all 0.3s ease;`;
  close_btn.onmouseenter = () => {
    close_btn.style.background = "#ff3c3c22";
    close_btn.style.borderColor = "#ff3c3c";
    close_btn.style.color = "#ff3c3c";
  };
  close_btn.onmouseleave = () => {
    close_btn.style.background = "transparent";
    close_btn.style.borderColor = "#00ff7f44";
    close_btn.style.color = "#00ff7f";
  };
  const info_content = document.createElement("div");
  info_content.style.cssText = `color: #ccc; line-height: 1.6; font-size: 0.95em; max-height: 300px; overflow-y: auto;`;
  info_content.textContent = tool_description || "No description available.";
  const usage_header = document.createElement("div");
  usage_header.style.cssText = `display: flex; justify-content: space-between; align-items: center; margin-top: 15px; margin-bottom: 10px; border-bottom: 1px solid #00ff7f33; padding-bottom: 10px;`;
  const usage_title = document.createElement("h4");
  usage_title.textContent = "HOW TO USE";
  usage_title.style.cssText = `color: #00ff9c; margin: 0; font-size: 1.1em;`;
  usage_header.appendChild(usage_title);
  info_content.appendChild(usage_header);
  const content = document.createElement("div");
  content.style.cssText = `color: #ccc; line-height: 1.6; font-size: 0.95em;`;
  content.textContent = usage || "No usage instructions available.";
  info_content.appendChild(content);
  const info_footer = document.createElement("div");
  info_footer.style.cssText = `margin-top: 15px; padding-top: 10px; border-top: 1px solid #00ff7f33; display: flex; justify-content: space-between; align-items: center; font-size: 0.85em;`;
  const price_tag = document.createElement("span");
  price_tag.textContent = `Price: ${tool_price} Tokens`;
  price_tag.style.cssText = `color: #00ff7f; font-weight: bold;`;
  const tool_id_tag = document.createElement("span");
  tool_id_tag.textContent = `ID: ${tool_id}`;
  tool_id_tag.style.cssText = `color: #888; font-size: 0.9em;`;
  info_footer.appendChild(price_tag);
  info_footer.appendChild(tool_id_tag);
  info_header.appendChild(info_title);
  info_header.appendChild(close_btn);
  info_popup.appendChild(info_header);
  info_popup.appendChild(info_content);
  info_popup.appendChild(info_footer);
  card2.style.position = "relative";

  // ============================================
  // SLEEK MODERN BUTTON SETUP - Floating Style
  // ============================================
  button_group_top.style.display = "flex";
  button_group_top.style.gap = "12px";
  button_group_top.style.marginTop = "10px";

  const styleButton = (btn) => {
    btn.style.flex = "1";
    btn.style.padding = "14px 16px";
    btn.style.fontSize = "0.9rem";
    btn.style.fontWeight = "700";
    btn.style.letterSpacing = "0.5px";
    btn.style.textTransform = "uppercase";
    btn.style.border = "1px solid #2a2a2a";
    btn.style.borderRadius = "12px";
    btn.style.background = "linear-gradient(135deg, #1a1a1a, #141414)";
    btn.style.color = "#ffffff";
    btn.style.cursor = "pointer";
    btn.style.transition = "all 0.3s ease";
    btn.style.textAlign = "center";
    btn.style.fontFamily = "'Inter', sans-serif";
    btn.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)";
    btn.style.position = "relative";
  };

  styleButton(btn_unlock);
  styleButton(btn_info);
  styleButton(btn_download);
;
  btn_unlock.style.display = 'flex';
  btn_unlock.style.alignItems = 'center';
  btn_unlock.style.justifyContent = 'center';

  btn_unlock.onmouseenter = () => {
    btn_unlock.style.background = "linear-gradient(135deg, #2a2a2a, #1a1a1a)";
    btn_unlock.style.transform = "translateY(-3px)";
    btn_unlock.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)";
    btn_unlock.style.borderColor = "#3a3a3a";
  };
  btn_unlock.onmouseleave = () => {
    btn_unlock.style.background = "linear-gradient(135deg, #1a1a1a, #141414)";
    btn_unlock.style.transform = "translateY(0)";
    btn_unlock.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)";
    btn_unlock.style.borderColor = "#2a2a2a";

  };

  btn_info.onmouseenter = () => {
    btn_info.style.background = "linear-gradient(135deg, #2a2a2a, #1a1a1a)";
    btn_info.style.transform = "translateY(-3px)";
    btn_info.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)";
    btn_info.style.borderColor = "#3a3a3a";
  };
  btn_info.onmouseleave = () => {
    btn_info.style.background = "linear-gradient(135deg, #1a1a1a, #141414)";
    btn_info.style.transform = "translateY(0)";
    btn_info.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)";
    btn_info.style.borderColor = "#2a2a2a";
  };

  [btn_unlock, btn_info].forEach(btn => {
    btn.onmousedown = () => { btn.style.transform = "translateY(0)"; };
    btn.onmouseup = () => { btn.style.transform = "translateY(-3px)"; };
  });

  let actionLabel = "Download";
  switch(tool_category.toLowerCase()) {
    case 'design': actionLabel = "View"; break;
    case 'marketing': actionLabel = "Watch"; break;
    case 'education': actionLabel = "Learn"; break;
    case 'business': actionLabel = "Access"; break;
    default: actionLabel = "Download";
  }

  if (isPurchased) {
    btn_unlock.style.display = 'none';
    btn_download.style.background = "linear-gradient(135deg, #ffffff, #e0e0e0)";
    btn_download.style.color = "#000";
    btn_download.style.cursor = "pointer";
    btn_download.disabled = false;
    btn_download.textContent = `✓ ${actionLabel}`;
    btn_download.style.boxShadow = "0 4px 16px rgba(255, 255, 255, 0.2), 0 2px 8px rgba(255, 255, 255, 0.1)";
    btn_download.style.borderColor = "#4a4a4a";
    
    btn_download.addEventListener('click', async () => {
      if (download_link) {
        window.open(download_link, '_blank');
        try {
          const toolPath = tool.key;
          const downloadCountRef = ref(db, `tools/${toolPath}/downloadCount`);
          const currentCount = await get(downloadCountRef);
          const newCount = (currentCount.val() || 0) + 1;
          await set(downloadCountRef, newCount);
        } catch (error) {
          console.error('Error updating count:', error);
        }
      } else {
        alert('❌ No download link available.');
      }
    });
    
    btn_download.onmouseenter = () => {
      btn_download.style.background = "linear-gradient(135deg, #ffffff, #f5f5f5)";
      btn_download.style.transform = "translateY(-3px)";
      btn_download.style.boxShadow = "0 8px 24px rgba(255, 255, 255, 0.3), 0 4px 12px rgba(255, 255, 255, 0.2)";
    };
    btn_download.onmouseleave = () => {
      btn_download.style.background = "linear-gradient(135deg, #ffffff, #e0e0e0)";
      btn_download.style.transform = "translateY(0)";
      btn_download.style.boxShadow = "0 4px 16px rgba(255, 255, 255, 0.2), 0 2px 8px rgba(255, 255, 255, 0.1)";
    };
    btn_download.onmousedown = () => { btn_download.style.transform = "translateY(0)"; };
    btn_download.onmouseup = () => { btn_download.style.transform = "translateY(-3px)"; };
    
  } else {
    btn_unlock.style.display = 'flex';
    btn_download.style.background = "linear-gradient(135deg, #0f0f0f, #0a0a0a)";
    btn_download.style.color = "#555";
    btn_download.style.cursor = "not-allowed";
    btn_download.style.opacity = "0.7";
    btn_download.disabled = true;
    btn_download.textContent = `🔒 ${actionLabel}`;
    btn_download.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
    btn_download.style.borderColor = "#1a1a1a";
    
    btn_unlock.addEventListener('click', () => {
      window.location.href = '../Bank/bank.html';
    });
    
    btn_download.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Please purchase this tool first!');
    });
    
    btn_download.onmouseenter = () => {};
    btn_download.onmouseleave = () => {};
  }

  btn_info.addEventListener('click', () => {
    info_popup.style.display = 'block';
  });

  close_btn.addEventListener('click', () => {
    info_popup.style.display = 'none';
  });

  info_popup.addEventListener('click', (e) => {
    if (e.target === info_popup) {
      info_popup.style.display = 'none';
    }
  });

  button_group_top.appendChild(btn_unlock);
  button_group_top.appendChild(btn_info);
  button_group_top.appendChild(btn_download);

  card2.style.background = "#111";
  card2.style.border = "1px solid #00ff7f33";
  card2.style.borderRadius = "12px";
  card2.style.overflow = "hidden";
  card2.style.transition = "all 0.3s ease";
  card2.style.display = "flex";
  card2.style.flexDirection = "column";
  card2.style.height = "100%";
  card2.style.margin = "0px";
  card2.style.animation = "fadeIn 0.5s ease-in";

  product_img_wrapper.style.width = "100%";
  product_img_wrapper.style.height = "200px";
  product_img_wrapper.style.overflow = "hidden";
  product_img_wrapper.style.position = "relative";
  product_img_wrapper.style.background = "#0a0a0a";

  product_img.style.width = "100%";
  product_img.style.height = "100%";
  product_img.style.objectFit = "cover";
  product_img.style.transition = "transform 0.3s ease";

  product_info.style.padding = "16px";
  product_info.style.display = "flex";
  product_info.style.flexDirection = "column";
  product_info.style.gap = "12px";
  product_info.style.flex = "1";

  product_header.style.display = "flex";
  product_header.style.justifyContent = "space-between";
  product_header.style.alignItems = "flex-start";
  product_header.style.gap = "10px";

  h3.style.fontSize = "1.05em";
  h3.style.color = "#00ff9c";
  h3.style.margin = "0";
  h3.style.lineHeight = "1.3";
  h3.style.wordBreak = "break-word";

  price.style.background = "#00ff7f22";
  price.style.color = "#00ff7f";
  price.style.padding = "4px 8px";
  price.style.borderRadius = "4px";
  price.style.fontWeight = "bold";
  price.style.fontSize = "0.9rem";
  price.style.whiteSpace = "nowrap";
  price.style.border = "1px solid #00ff7f33";

  product_id.style.display = "flex";
  product_id.style.alignItems = "center";
  product_id.style.gap = "6px";
  product_id.style.fontSize = "0.85rem";
  product_id.style.color = "#888";
  product_id.style.padding = "6px 10px";
  product_id.style.background = "#0a0a0a";
  product_id.style.borderRadius = "4px";
  product_id.style.border = "1px solid #00ff7f22";

  copy_icon.style.cursor = "pointer";
  copy_icon.style.color = "#00ff7f";
  copy_icon.style.transition = "all 0.2s";
  copy_icon.style.fontSize = "1rem";

  user_info.style.display = "flex";
  user_info.style.alignItems = "center";
  user_info.style.justifyContent = "space-between";
  user_info.style.gap = "10px";
  user_info.style.padding = "10px";
  user_info.style.background = "#0a0a0a";
  user_info.style.borderRadius = "6px";
  user_info.style.border = "1px solid #00ff7f22";

  product_img_wrapper.appendChild(product_img);
  product_title.appendChild(h3);
  product_header.appendChild(product_title);
  product_header.appendChild(price);
  product_id.appendChild(id);
  product_id.appendChild(copy_icon);

  const user_details = document.createElement("div");
  user_details.style.display = "flex";
  user_details.style.alignItems = "center";
  user_details.style.gap = "10px";
  user_details.appendChild(user_avatar);
  user_details.appendChild(user_name);

  user_info.appendChild(user_details);
  user_info.appendChild(time_label);

  product_info.appendChild(product_header);
  product_info.appendChild(product_id);
  product_info.appendChild(download_info);
  product_info.appendChild(user_info);
  product_info.appendChild(button_group_top);

  card2.appendChild(product_img_wrapper);
  card2.appendChild(product_info);
  card2.appendChild(info_popup);

  marketContainer.appendChild(card2);
}

showSkeletonLoading();

onValue(ref(db, "tools"), async (snapshot) => {
  clearSkeletonLoading();
  if (snapshot.exists()) {
    const data = snapshot.val();
    allToolsData = [];
    Object.keys(data).forEach(userId => {
      if (typeof data[userId] === 'object') {
        Object.keys(data[userId]).forEach(toolKey => {
          allToolsData.push({
            ...data[userId][toolKey],
            key: `${userId}/${toolKey}`,
            sellerId: userId
          });
        });
      }
    });
    allToolsData.sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
    console.log(`📦 Loaded ${allToolsData.length} tools`);
    await renderTools('all');
  } else {
    marketContainer.innerHTML = '<p style="color: #888; text-align: center; padding: 40px;">No tools available yet.</p>';
  }
});

if (categoryFilter) {
  categoryFilter.addEventListener('change', async (e) => {
    const selectedCategory = e.target.value;
    console.log(`🔍 Filtering by category: ${selectedCategory}`);
    clearSkeletonLoading();
    showSkeletonLoading();
    setTimeout(async () => {
      await renderTools(selectedCategory);
    }, 300);
  });
}
