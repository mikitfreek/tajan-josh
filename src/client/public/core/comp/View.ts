/**
 * Inserts as a first child of html element
 *  @param {HTMLElement} el
 *  @param {string} html
 */
const insertHTML = (el: HTMLElement, html: string) => el.insertAdjacentHTML("afterbegin", html);

/**
 * Replaces children of html element
 *  @param {HTMLElement} el
 *  @param {string} html
 */
const replaceHTML = (el: HTMLElement, html: string) => {
    el.replaceChildren();
    insertHTML(el, html);
};

export class View {
  constructor() { }

  init() {
    const glob = globalThis
    const GameUI = glob.document.getElementById('GameUI')
    replaceHTML(GameUI, this.htmlGameUI)
    const UI = glob.document.getElementById('UI')
    replaceHTML(UI, this.htmlUI)
  }

  htmlGameUI = `
  <div class="up">
    <div class="btns-menu">
      <div id="menu" class="btn">
        <i class="bx bx-menu"></i>
      </div>
      <div class="middle">
        <div class="time">
          0:00
        </div>
        <div class="last">
          <p>last figure:</p>
          <span id="last">
          </span>
          <div id="last-fig"></div>
        </div>
        <div id="alert"></div>
      </div>
      <div id="online" class="btn">
        <!-- <span>&#10120;</span>
                <div>online</div> -->
      </div>
    </div>
  </div>
  <div class="dn">
    <div id="action" class="btns-action">
      <div id="fire" class="btn">
        <div>Check</div>
      </div>
      <div id="raise" class="btn">
        <div>Raise</div>
      </div>
    </div>
  </div>`

  htmlUI = `
  <div class="sidebar">
    <div class="logo-details">
      <i class="bx bxl-c-plus-plus icon"></i>
      <div class="logo_name">Protect-Game</div>
      <i class="bx bx-menu" id="btn"></i>
    </div>
    <ul class="nav-list">
      <!-- <li>
              <i class="bx bx-search"></i>
              <input type="text" placeholder="Search...">
              <span class="tooltip">Search</span>
            </li> -->
      <!-- <li>
              <a href="#">
                <i class="bx bx-grid-alt"></i>
                <span class="links_name">Dashboard</span>
              </a>
              <span class="tooltip">Dashboard</span>
            </li> -->
      <li>
        <a href="#">
          <i class="bx bx-chat"></i>
          <span class="links_name">Messages</span>
        </a>
        <span class="tooltip">Messages</span>
      </li>
      <!-- <li>
              <a href="#">
                <i class="bx bx-user"></i>
                <span class="links_name">User</span>
              </a>
              <span class="tooltip">User</span>
            </li> -->
      <!-- <li>
              <a href="#">
                <i class="bx bx-pie-chart-alt-2"></i>
                <span class="links_name">Analytics</span>
              </a>
              <span class="tooltip">Analytics</span>
            </li> -->
      <!-- <li>
              <a href="#">
                <i class="bx bx-folder"></i>
                <span class="links_name">File Manager</span>
              </a>
              <span class="tooltip">Files</span>
            </li>
            <li>
              <a href="#">
                <i class="bx bx-cart-alt"></i>
                <span class="links_name">Order</span>
              </a>
              <span class="tooltip">Order</span>
            </li> -->
      <li>
        <a href="#">
          <i class="bx bx-heart"></i>
          <span class="links_name">Saved</span>
        </a>
        <span class="tooltip">Saved</span>
      </li>
      <li>
        <a href="#">
          <i class="bx bx-cog"></i>
          <span class="links_name">Setting</span>
        </a>
        <span class="tooltip">Setting</span>
      </li>
      <li class="profile">
        <div class="profile-details">
          <img src="https://via.placeholder.com/64" alt="profileImg">
          <div class="name_job">
            <div class="name">Nickname</div>
            <div class="job">Role</div>
          </div>
        </div>
        <i class="bx bx-log-out" id="log_out"></i>
      </li>
    </ul>
  </div>
  <section class="ui-section">
    <div class="text">Dashboard</div>
  </section>`
}