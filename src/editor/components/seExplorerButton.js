/* globals svgEditor */

/**
 * 解析模块路径为浏览器可访问的 URL
 * @param {string} modulePath - 模块路径（如 "vue3-svgedit/dist/vue3/extensions/ext-shapes/shapelib/"）
 * @returns {string} - 浏览器可访问的 URL 路径
 */
function resolveModulePathToUrl (modulePath) {
  // 如果已经是完整的 URL，直接返回
  if (modulePath.startsWith('http://') || modulePath.startsWith('https://')) {
    return modulePath
  }
  
  // 如果已经是绝对路径且不包含包名，直接返回
  if (modulePath.startsWith('/') && !modulePath.includes('vue3-svgedit') && !modulePath.includes('node_modules') && !modulePath.startsWith('/./')) {
    return modulePath
  }
  
  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      const currentUrl = new URL(import.meta.url)
      const pathname = currentUrl.pathname
      
      // 处理 Vite 的 /@fs/ 路径格式
      const isViteFsPath = pathname.startsWith('/@fs/')
      
      // 查找 vue3-svgedit 包的位置
      let packageBasePath = null
      const vue3Index = pathname.indexOf('vue3-svgedit')
      
      if (vue3Index !== -1) {
        // 找到包名，提取包的基础路径
        packageBasePath = pathname.substring(0, vue3Index + 'vue3-svgedit'.length)
      } else if (pathname.includes('node_modules')) {
        // 在 node_modules 中，尝试找到包
        const nodeModulesIndex = pathname.indexOf('node_modules')
        const afterNodeModules = pathname.substring(nodeModulesIndex + 'node_modules'.length + 1)
        const firstSlash = afterNodeModules.indexOf('/')
        if (firstSlash !== -1) {
          const packageName = afterNodeModules.substring(0, firstSlash)
          if (packageName === 'vue3-svgedit') {
            packageBasePath = pathname.substring(0, nodeModulesIndex + 'node_modules'.length + 1 + firstSlash)
          }
        }
      } else if (isViteFsPath && pathname.includes('svgedit')) {
        // Vite /@fs/ 路径：/@fs/root/projects/svgedit/dist/vue3/Editor.js
        // 需要找到 svgedit 项目根目录
        const svgeditIndex = pathname.indexOf('svgedit')
        if (svgeditIndex !== -1) {
          // 找到 svgedit 之后的下一个 /，这就是项目根目录
          const afterSvgedit = pathname.substring(svgeditIndex + 'svgedit'.length)
          const nextSlash = afterSvgedit.indexOf('/')
          if (nextSlash !== -1) {
            // 项目根目录：/@fs/root/projects/svgedit
            packageBasePath = pathname.substring(0, svgeditIndex + 'svgedit'.length)
          }
        }
      }
      
      if (packageBasePath) {
        // 从模块路径中提取相对路径部分
        let relativePath = ''
        
        // 处理相对路径 ./extensions/...
        if (modulePath.startsWith('./extensions/')) {
          // 相对路径 ./extensions/ext-shapes/shapelib/ -> dist/vue3/extensions/ext-shapes/shapelib/
          relativePath = 'dist/vue3/' + modulePath.substring(2) // 去掉 ./
        } else if (modulePath.startsWith('./')) {
          // 其他以 ./ 开头的相对路径
          // 如果路径包含 extensions，假设它是相对于包根目录的
          if (modulePath.includes('extensions')) {
            relativePath = 'dist/vue3/' + modulePath.substring(2) // 去掉 ./
          } else {
            // 默认处理：./xxx -> dist/vue3/xxx
            relativePath = 'dist/vue3/' + modulePath.substring(2)
          }
        } else if (modulePath.includes('ext-shapes/shapelib')) {
          // 直接指定 shapelib 路径
          relativePath = 'dist/vue3/extensions/ext-shapes/shapelib/'
        } else if (modulePath.includes('dist/vue3/extensions')) {
          // 提取 dist/vue3/extensions 之后的部分
          const distIndex = modulePath.indexOf('dist/vue3/extensions')
          relativePath = modulePath.substring(distIndex)
        } else if (modulePath.includes('vue3-svgedit')) {
          // 提取 vue3-svgedit 之后的部分
          const pkgIndex = modulePath.indexOf('vue3-svgedit')
          relativePath = modulePath.substring(pkgIndex + 'vue3-svgedit'.length).replace(/^\/+/, '')
        } else {
          // 使用原始路径
          relativePath = modulePath
        }
        
        // 构建完整的 URL 路径
        const resolvedPath = `${packageBasePath}/${relativePath}`.replace(/\/+/g, '/')
        console.log('[resolveModulePathToUrl] 路径解析:', {
          original: modulePath,
          packageBasePath,
          relativePath,
          resolved: resolvedPath
        })
        return resolvedPath
      } else {
        // 如果找不到包路径，尝试从当前文件位置推断
        console.warn('[resolveModulePathToUrl] 未找到包路径，尝试从当前文件推断:', {
          pathname,
          modulePath
        })
        
        // 处理 Vite /@fs/ 路径
        if (pathname.startsWith('/@fs/') && pathname.includes('svgedit')) {
          const svgeditIndex = pathname.indexOf('svgedit')
          if (svgeditIndex !== -1) {
            // 找到项目根目录：/@fs/root/projects/svgedit
            const projectRoot = pathname.substring(0, svgeditIndex + 'svgedit'.length)
            
            // 处理相对路径
            let relativePath = ''
            if (modulePath.startsWith('./extensions/')) {
              relativePath = 'dist/vue3/' + modulePath.substring(2)
            } else if (modulePath.startsWith('./')) {
              relativePath = 'dist/vue3/' + modulePath.substring(2)
            } else {
              relativePath = 'dist/vue3/extensions/' + modulePath.replace(/^\/+/, '')
            }
            
            const resolvedPath = `${projectRoot}/${relativePath}`.replace(/\/+/g, '/')
            console.log('[resolveModulePathToUrl] Vite /@fs/ 路径推断:', {
              original: modulePath,
              projectRoot,
              relativePath,
              resolved: resolvedPath
            })
            return resolvedPath
          }
        }
        
        // 如果当前文件在 components 目录，尝试向上查找
        if (pathname.includes('/components/')) {
          const componentsIndex = pathname.indexOf('/components/')
          const basePath = pathname.substring(0, componentsIndex)
          
          // 查找 dist/vue3 的位置
          if (basePath.includes('dist/vue3')) {
            const distIndex = basePath.indexOf('dist/vue3')
            // 找到包根目录（dist 之前）
            const beforeDist = basePath.substring(0, distIndex)
            const lastSlash = beforeDist.lastIndexOf('/')
            
            if (lastSlash !== -1) {
              // 构建包路径：.../vue3-svgedit
              const inferredPackagePath = beforeDist.substring(0, lastSlash + 1) + 'vue3-svgedit'
              
              // 处理相对路径
              let relativePath = ''
              if (modulePath.startsWith('./extensions/')) {
                relativePath = 'dist/vue3/' + modulePath.substring(2)
              } else if (modulePath.startsWith('./')) {
                relativePath = 'dist/vue3/' + modulePath.substring(2)
              } else {
                relativePath = 'dist/vue3/extensions/' + modulePath.replace(/^\/+/, '')
              }
              
              const resolvedPath = `${inferredPackagePath}/${relativePath}`.replace(/\/+/g, '/')
              console.log('[resolveModulePathToUrl] 推断路径:', {
                original: modulePath,
                inferredPackagePath,
                relativePath,
                resolved: resolvedPath
              })
              return resolvedPath
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('路径解析失败:', modulePath, e)
  }
  
  // 如果所有解析都失败，返回原始路径（添加 / 前缀，但处理 ./ 开头的情况）
  if (modulePath.startsWith('./')) {
    // 对于 ./ 开头的路径，不应该直接添加 /
    console.warn('无法解析相对路径，尝试使用默认处理:', modulePath)
    return '/' + modulePath.substring(2) // 去掉 ./
  }
  return modulePath.startsWith('/') ? modulePath : '/' + modulePath
}

/**
 * @class ExplorerButton
 */
export class ExplorerButton extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    // create the shadowDom and insert the template
    this.imgPath = svgEditor.configObj.curConfig.imgPath
    this.template = this.createTemplate(this.imgPath)
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(this.template.content.cloneNode(true))
    // locate the component
    this.$button = this._shadowRoot.querySelector('.menu-button')
    this.$overall = this._shadowRoot.querySelector('.overall')
    this.$img = this._shadowRoot.querySelector('.menu-button img')
    this.$menu = this._shadowRoot.querySelector('.menu')
    this.$handle = this._shadowRoot.querySelector('.handle')
    this.$lib = this._shadowRoot.querySelector('.image-lib')
    this.files = []
    this.request = new XMLHttpRequest()
    this.imgPath = svgEditor.configObj.curConfig.imgPath

    // Closes opened (pressed) lib menu on click on the canvas
    const workarea = document.getElementById('workarea')
    workarea.addEventListener('click', (e) => {
      this.$menu.classList.remove('open')
      this.$lib.classList.remove('open-lib')
    })
  }

  /**
   * @function createTemplate
   * @param {string} imgPath
   * @returns {any} template
   */

  createTemplate (imgPath) {
    const template = document.createElement('template')
    template.innerHTML = `
    <style>
    :host {
      position:relative;
    }
    .menu-button:hover, se-button:hover, .menu-item:hover
    {
      background-color: var(--icon-bg-color-hover);
    }
    img {
      border: none;
      width: 24px;
      height: 24px;
    }
    .overall.pressed .button-icon,
    .overall.pressed,
    .menu-item.pressed {
      background-color: var(--icon-bg-color-hover) !important;
    }
    .overall.pressed .menu-button {
      background-color: var(--icon-bg-color-hover) !important;
    }
    .disabled {
      opacity: 0.3;
      cursor: default;
    }
    .menu-button {
      height: 24px;
      width: 24px;
      margin: 2px 1px 4px;
      padding: 3px;
      background-color: var(--icon-bg-color);
      cursor: pointer;
      position: relative;
      border-radius: 3px;
      overflow: hidden;
    }
    .handle {
      height: 8px;
      width: 8px;
      background-image: url(${imgPath}/handle.svg);
      position:absolute;
      bottom: 0px;
      right: 0px;
    }
    .button-icon {
    }
    .menu {
      position: fixed;
      margin-left: 34px;
      background: none !important;
      display:none;
      top: 30%;
      left: 171px;
    }
    .image-lib {
      position: fixed;
      left: 34px;
      top: 30%;
      background: #E8E8E8;
      display: none;
      flex-wrap: wrap;
      flex-direction: row;
      width: 170px;
    }
    .menu-item {
      line-height: 1em;
      padding: 0.5em;
      border: 1px solid #5a6162;
      background: #E8E8E8;
      margin-bottom: -1px;
      white-space: nowrap;
    }
    .open-lib {
      display: inline-flex;
    }
    .open {
      display: block;
    }
    .overall {
      background: none !important;
    }
    </style>
  
    <div class="overall">
      <div class="menu-button">
        <img class="button-icon" src="explorer.svg" alt="icon">
        <div class="handle"></div>
      </div>
      <div class="image-lib"">
        <se-button></se-button>
     </div>
      <div class="menu">
        <div class="menu-item">menu</div>
     </div>
    </div>`
    return template
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['title', 'pressed', 'disabled', 'lib', 'src']
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  async attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue === newValue) return
    switch (name) {
      case 'title':
        {
          const shortcut = this.getAttribute('shortcut')
          this.$button.setAttribute('title', `${newValue} [${shortcut}]`)
        }
        break
      case 'pressed':
        if (newValue) {
          this.$overall.classList.add('pressed')
        } else {
          this.$overall.classList.remove('pressed')
        }
        break
      case 'disabled':
        if (newValue) {
          this.$overall.classList.add('disabled')
        } else {
          this.$overall.classList.remove('disabled')
        }
        break
      case 'lib':
        try {
          // 使用统一的路径解析函数
          const libPath = resolveModulePathToUrl(newValue)
          
          // 添加调试信息
          console.log('[seExplorerButton] 解析 lib 路径:', {
            original: newValue,
            resolved: libPath,
            finalUrl: `${libPath}index.json`
          })
          
          const response = await fetch(`${libPath}index.json`)
          if (!response.ok) {
            throw new Error(`Failed to fetch ${libPath}index.json: ${response.status} ${response.statusText}`)
          }
          // 检查响应内容类型，确保是 JSON
          const contentType = response.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text()
            console.error(`Expected JSON but got ${contentType}. Response:`, text.substring(0, 200))
            throw new Error(`Invalid response type: expected JSON but got ${contentType}. URL: ${libPath}index.json`)
          }
          const json = await response.json()
          const { lib } = json
          this.$menu.innerHTML = lib.map((menu, i) => (
          `<div data-menu="${menu}" class="menu-item ${(i === 0) ? 'pressed' : ''} ">${menu}</div>`
          )).join('')
          await this.updateLib(lib[0])
        } catch (error) {
          console.error(error)
        }
        break
      case 'src':
        this.$img.setAttribute('src', this.imgPath + '/' + newValue)
        break
      default:
        console.error(`unknown attribute: ${name}`)
        break
    }
  }

  /**
   * @function get
   * @returns {any}
   */
  get title () {
    return this.getAttribute('title')
  }

  /**
   * @function set
   * @returns {void}
   */
  set title (value) {
    this.setAttribute('title', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get pressed () {
    return this.hasAttribute('pressed')
  }

  /**
   * @function set
   * @returns {void}
   */
  set pressed (value) {
    // boolean value => existence = true
    if (value) {
      this.setAttribute('pressed', 'true')
    } else {
      this.removeAttribute('pressed', '')
    }
  }

  /**
   * @function get
   * @returns {any}
   */
  get disabled () {
    return this.hasAttribute('disabled')
  }

  /**
   * @function set
   * @returns {void}
   */
  set disabled (value) {
    // boolean value => existence = true
    if (value) {
      this.setAttribute('disabled', 'true')
    } else {
      this.removeAttribute('disabled', '')
    }
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    // capture click event on the button to manage the logic
    const onClickHandler = (ev) => {
      ev.stopPropagation()
      switch (ev.target.nodeName) {
        case 'SE-EXPLORERBUTTON':
          this.$menu.classList.toggle('open')
          this.$lib.classList.toggle('open-lib')
          break
        case 'SE-BUTTON':
        // change to the current action
          this.currentAction = ev.target
          this.$img.setAttribute('src', this.currentAction.getAttribute('src'))
          this.dataset.draw = this.data[this.currentAction.dataset.shape]
          this._shadowRoot.querySelectorAll('.image-lib [pressed]').forEach((b) => { b.pressed = false })
          this.currentAction.setAttribute('pressed', 'pressed')
          // and close the menu
          this.$menu.classList.remove('open')
          this.$lib.classList.remove('open-lib')
          break
        case 'DIV':
          if (ev.target.classList[0] === 'handle') {
          // this is a click on the handle so let's open/close the menu.
            this.$menu.classList.toggle('open')
            this.$lib.classList.toggle('open-lib')
          } else {
            this._shadowRoot.querySelectorAll('.menu > .pressed').forEach((b) => { b.classList.remove('pressed') })
            ev.target.classList.add('pressed')
            this.updateLib(ev.target.dataset.menu)
          }
          break
        default:
          console.error('unknown nodeName for:', ev.target, ev.target.className)
      }
    }
    // capture event from slots
    svgEditor.$click(this, onClickHandler)
    svgEditor.$click(this.$menu, onClickHandler)
    svgEditor.$click(this.$lib, onClickHandler)
    svgEditor.$click(this.$handle, onClickHandler)
  }

  /**
   * @function updateLib
   * @param {string} lib
   * @returns {void}
   */
  async updateLib (lib) {
    const originalLibDir = this.getAttribute('lib')
    
    // 使用统一的路径解析函数
    const libDir = resolveModulePathToUrl(originalLibDir)
    
    // 添加调试信息
    console.log('[seExplorerButton] updateLib 解析路径:', {
      original: originalLibDir,
      resolved: libDir,
      lib: lib,
      finalUrl: `${libDir}${lib}.json`
    })
    
    try {
      // initialize buttons for all shapes defined for this library
      const response = await fetch(`${libDir}${lib}.json`)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${libDir}${lib}.json: ${response.status} ${response.statusText}`)
      }
      // 检查响应内容类型，确保是 JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error(`Expected JSON but got ${contentType}. Response:`, text.substring(0, 200))
        throw new Error(`Invalid response type: expected JSON but got ${contentType}. URL: ${libDir}${lib}.json`)
      }
      const json = await response.json()
      this.data = json.data
      const size = json.size ?? 300
      const fill = json.fill ? '#333' : 'none'
      const off = size * 0.05
      const vb = [-off, -off, size + off * 2, size + off * 2].join(' ')
      const stroke = json.fill ? 0 : (size / 30)
      this.$lib.innerHTML = Object.entries(this.data).map(([key, path]) => {
        const encoded = btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <svg viewBox="${vb}"><path fill="${fill}" stroke="#f8bb00" stroke-width="${stroke}" d="${path}"></path></svg>
        </svg>`)
        return `<se-button data-shape="${key}"src="data:image/svg+xml;base64,${encoded}"></se-button>`
      }).join('')
    } catch (error) {
      console.error(`could not read file:${libDir}${lib}.json`, error)
    }
  }
}

// Register
customElements.define('se-explorerbutton', ExplorerButton)

