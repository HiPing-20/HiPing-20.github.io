document.addEventListener('DOMContentLoaded', function () {
  let headerContentWidth, $nav
  let mobileSidebarOpen = false

  const adjustMenu = init => {
    const getAllWidth = ele => {
      let width = 0
      ele.length && Array.from(ele).forEach(i => { width += i.offsetWidth })
      return width
    }

    if (init) {
      const blogInfoWidth = getAllWidth(document.querySelector('#blog-info > a').children)
      const menusWidth = getAllWidth(document.getElementById('menus').children)
      headerContentWidth = blogInfoWidth + menusWidth
      $nav = document.getElementById('nav')
    }

    let hideMenuIndex = ''
    if (window.innerWidth <= 768) hideMenuIndex = true
    else hideMenuIndex = headerContentWidth > $nav.offsetWidth - 120

    if (hideMenuIndex) {
      $nav.classList.add('hide-menu')
    } else {
      $nav.classList.remove('hide-menu')
    }
  }

  // 初始化header
  const initAdjust = () => {
    adjustMenu(true)
    $nav.classList.add('show')
  }

  // sidebar menus
  const sidebarFn = {
    open: () => {
      btf.sidebarPaddingR()
      document.body.style.overflow = 'hidden'
      btf.animateIn(document.getElementById('menu-mask'), 'to_show 0.5s')
      document.getElementById('sidebar-menus').classList.add('open')
      mobileSidebarOpen = true
    },
    close: () => {
      const $body = document.body
      $body.style.overflow = ''
      $body.style.paddingRight = ''
      btf.animateOut(document.getElementById('menu-mask'), 'to_hide 0.5s')
      document.getElementById('sidebar-menus').classList.remove('open')
      mobileSidebarOpen = false
    }
  }

  /**
   * 首頁top_img底下的箭頭
   */
  const scrollDownInIndex = () => {
    const $scrollDownEle = document.getElementById('scroll-down')
    $scrollDownEle && $scrollDownEle.addEventListener('click', function () {
      btf.scrollToDest(document.getElementById('content-inner').offsetTop, 300)
    })
  }

  /**
   * 代碼
   * 只適用於Hexo默認的代碼渲染
   */
  const addHighlightTool = function () {
    const highLight = GLOBAL_CONFIG.highlight
    if (!highLight) return

    const { highlightCopy, highlightLang, highlightHeightLimit, plugin } = highLight
    const isHighlightShrink = GLOBAL_CONFIG_SITE.isHighlightShrink
    const isShowTool = highlightCopy || highlightLang || isHighlightShrink !== undefined
    const $figureHighlight = plugin === 'highlighjs' ? document.querySelectorAll('figure.highlight') : document.querySelectorAll('pre[class*="language-"]')

    if (!((isShowTool || highlightHeightLimit) && $figureHighlight.length)) return

    const isPrismjs = plugin === 'prismjs'
    const highlightShrinkClass = isHighlightShrink === true ? 'closed' : ''
    const highlightShrinkEle = isHighlightShrink !== undefined ? `<i class="fas fa-angle-down expand ${highlightShrinkClass}"></i>` : ''
    const highlightCopyEle = highlightCopy ? '<div class="copy-notice"></div><i class="fas fa-paste copy-button"></i>' : ''

    const copy = (text, ctx) => {
      if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
        document.execCommand('copy')
        if (GLOBAL_CONFIG.Snackbar !== undefined) {
          btf.snackbarShow(GLOBAL_CONFIG.copy.success)
        } else {
          const prevEle = ctx.previousElementSibling
          prevEle.textContent = GLOBAL_CONFIG.copy.success
          prevEle.style.opacity = 1
          setTimeout(() => { prevEle.style.opacity = 0 }, 700)
        }
      } else {
        if (GLOBAL_CONFIG.Snackbar !== undefined) {
          btf.snackbarShow(GLOBAL_CONFIG.copy.noSupport)
        } else {
          ctx.previousElementSibling.textContent = GLOBAL_CONFIG.copy.noSupport
        }
      }
    }

    // click events
    const highlightCopyFn = (ele) => {
      const $buttonParent = ele.parentNode
      $buttonParent.classList.add('copy-true')
      const selection = window.getSelection()
      const range = document.createRange()
      const preCodeSelector = isPrismjs ? 'pre code' : 'table .code pre'
      range.selectNodeContents($buttonParent.querySelectorAll(`${preCodeSelector}`)[0])
      selection.removeAllRanges()
      selection.addRange(range)
      const text = selection.toString()
      copy(text, ele.lastChild)
      selection.removeAllRanges()
      $buttonParent.classList.remove('copy-true')
    }

    const highlightShrinkFn = (ele) => {
      const $nextEle = [...ele.parentNode.children].slice(1)
      ele.firstChild.classList.toggle('closed')
      if (btf.isHidden($nextEle[$nextEle.length - 1])) {
        $nextEle.forEach(e => { e.style.display = 'block' })
      } else {
        $nextEle.forEach(e => { e.style.display = 'none' })
      }
    }

    const highlightToolsFn = function (e) {
      const $target = e.target.classList
      if ($target.contains('expand')) highlightShrinkFn(this)
      else if ($target.contains('copy-button')) highlightCopyFn(this)
    }

    const expandCode = function () {
      this.classList.toggle('expand-done')
    }

    function createEle (lang, item, service) {
      const fragment = document.createDocumentFragment()

      if (isShowTool) {
        const hlTools = document.createElement('div')
        hlTools.className = `highlight-tools ${highlightShrinkClass}`
        hlTools.innerHTML = highlightShrinkEle + lang + highlightCopyEle
        hlTools.addEventListener('click', highlightToolsFn)
        fragment.appendChild(hlTools)
      }

      if (highlightHeightLimit && item.offsetHeight > highlightHeightLimit + 30) {
        const ele = document.createElement('div')
        ele.className = 'code-expand-btn'
        ele.innerHTML = '<i class="fas fa-angle-double-down"></i>'
        ele.addEventListener('click', expandCode)
        fragment.appendChild(ele)
      }

      if (service === 'hl') {
        item.insertBefore(fragment, item.firstChild)
      } else {
        item.parentNode.insertBefore(fragment, item)
      }
    }

    if (isPrismjs) {
      $figureHighlight.forEach(item => {
        if (highlightLang) {
          const langName = item.getAttribute('data-language') || 'Code'
          const highlightLangEle = `<div class="code-lang">${langName}</div>`
          btf.wrap(item, 'figure', { class: 'highlight' })
          createEle(highlightLangEle, item)
        } else {
          btf.wrap(item, 'figure', { class: 'highlight' })
          createEle('', item)
        }
      })
    } else {
      $figureHighlight.forEach(function (item) {
        if (highlightLang) {
          let langName = item.getAttribute('class').split(' ')[1]
          if (langName === 'plain' || langName === undefined) langName = 'Code'
          const highlightLangEle = `<div class="code-lang">${langName}</div>`
          createEle(highlightLangEle, item, 'hl')
        } else {
          createEle('', item, 'hl')
        }
      })
    }
  }

  /**
   * PhotoFigcaption
   */
  function addPhotoFigcaption () {
    document.querySelectorAll('#article-container img').forEach(function (item) {
      const parentEle = item.parentNode
      const altValue = item.title || item.alt
      if (altValue && !parentEle.parentNode.classList.contains('justified-gallery')) {
        const ele = document.createElement('div')
        ele.className = 'img-alt is-center'
        ele.textContent = altValue
        parentEle.insertBefore(ele, item.nextSibling)
      }
    })
  }

  /**
   * Lightbox
   */
  const runLightbox = () => {
    btf.loadLightbox(document.querySelectorAll('#article-container img:not(.no-lightbox)'))
  }

  /**
   * justified-gallery 圖庫排版
   */
  const runJustifiedGallery = function (ele) {
    const htmlStr = arr => {
      let str = ''
      const replaceDq = str => str.replace(/"/g, '&quot;') // replace double quotes to &quot;
      arr.forEach(i => {
        const alt = i.alt ? `alt="${replaceDq(i.alt)}"` : ''
        const title = i.title ? `title="${replaceDq(i.title)}"` : ''
        str += `<div class="fj-gallery-item"><img src="${i.url}" ${alt + title}"></div>`
      })
      return str
    }

    const lazyloadFn = (i, arr, limit) => {
      const loadItem = limit
      const arrLength = arr.length
      if (arrLength > loadItem) i.insertAdjacentHTML('beforeend', htmlStr(arr.splice(0, loadItem)))
      else {
        i.insertAdjacentHTML('beforeend', htmlStr(arr))
        i.classList.remove('lazyload')
      }
      return arrLength > loadItem ? loadItem : arrLength
    }

    const fetchUrl = async (url) => {
      const response = await fetch(url)
      return await response.json()
    }

    const runJustifiedGallery = (item, arr) => {
      if (!item.classList.contains('lazyload')) item.innerHTML = htmlStr(arr)
      else {
        const limit = item.getAttribute('data-limit')
        lazyloadFn(item, arr, limit)
        const clickBtnFn = () => {
          const lastItemLength = lazyloadFn(item, arr, limit)
          fjGallery(item, 'appendImages', item.querySelectorAll(`.fj-gallery-item:nth-last-child(-n+${lastItemLength})`))
          btf.loadLightbox(item.querySelectorAll('img'))
          lastItemLength < limit && item.nextElementSibling.removeEventListener('click', clickBtnFn)
        }
        item.nextElementSibling.addEventListener('click', clickBtnFn)
      }
      btf.initJustifiedGallery(item)
      btf.loadLightbox(item.querySelectorAll('img'))
    }

    const addJustifiedGallery = () => {
      ele.forEach(item => {
        item.classList.contains('url')
          ? fetchUrl(item.textContent).then(res => { runJustifiedGallery(item, res) })
          : runJustifiedGallery(item, JSON.parse(item.textContent))
      })
    }

    if (window.fjGallery) {
      addJustifiedGallery()
      return
    }

    getCSS(`${GLOBAL_CONFIG.source.justifiedGallery.css}`)
    getScript(`${GLOBAL_CONFIG.source.justifiedGallery.js}`).then(addJustifiedGallery)
  }

  /**
   * rightside scroll percent
   */
  const rightsideScrollPercent = currentTop => {
    const perNum = btf.getScrollPercent(currentTop, document.body)
    const $goUp = document.getElementById('go-up')
    if (perNum < 95) {
      $goUp.classList.add('show-percent')
      $goUp.querySelector('.scroll-percent').textContent = perNum
    } else {
      $goUp.classList.remove('show-percent')
    }
  }

  /**
   * 滾動處理
   */
  const scrollFn = function () {
    const $rightside = document.getElementById('rightside')
    const innerHeight = window.innerHeight + 56
    let initTop = 0
    let isChatShow = true
    const $header = document.getElementById('page-header')
    const isChatBtn = typeof chatBtn !== 'undefined'
    const isShowPercent = GLOBAL_CONFIG.percent.rightside

    // 當滾動條小于 56 的時候
    if (document.body.scrollHeight <= innerHeight) {
      $rightside.style.cssText = 'opacity: 1; transform: translateX(-58px)'
      return
    }

    // find the scroll direction
    const scrollDirection = currentTop => {
      const result = currentTop > initTop // true is down & false is up
      initTop = currentTop
      return result
    }

    const scrollTask = btf.throttle(() => {
      const currentTop = window.scrollY || document.documentElement.scrollTop
      const isDown = scrollDirection(currentTop)
      if (currentTop > 56) {
        if (isDown) {
          if ($header.classList.contains('nav-visible')) $header.classList.remove('nav-visible')
          if (isChatBtn && isChatShow === true) {
            window.chatBtn.hide()
            isChatShow = false
          }
        } else {
          if (!$header.classList.contains('nav-visible')) $header.classList.add('nav-visible')
          if (isChatBtn && isChatShow === false) {
            window.chatBtn.show()
            isChatShow = true
          }
        }
        $header.classList.add('nav-fixed')
        if (window.getComputedStyle($rightside).getPropertyValue('opacity') === '0') {
          $rightside.style.cssText = 'opacity: 0.8; transform: translateX(-58px)'
        }
      } else {
        if (currentTop === 0) {
          $header.classList.remove('nav-fixed', 'nav-visible')
        }
        $rightside.style.cssText = "opacity: ''; transform: ''"
      }

      isShowPercent && rightsideScrollPercent(currentTop)

      if (document.body.scrollHeight <= innerHeight) {
        $rightside.style.cssText = 'opacity: 0.8; transform: translateX(-58px)'
      }
    }, 200)

    window.scrollCollect = scrollTask

    window.addEventListener('scroll', scrollCollect)
  }

  /**
  * toc,anchor
  */
  const scrollFnToDo = function () {
    const isToc = GLOBAL_CONFIG_SITE.isToc
    const isAnchor = GLOBAL_CONFIG.isAnchor
    const $article = document.getElementById('article-container')

    if (!($article && (isToc || isAnchor))) return

    let $tocLink, $cardToc, autoScrollToc, $tocPercentage, isExpand

    if (isToc) {
      const $cardTocLayout = document.getElementById('card-toc')
      $cardToc = $cardTocLayout.getElementsByClassName('toc-content')[0]
      $tocLink = $cardToc.querySelectorAll('.toc-link')
      $tocPercentage = $cardTocLayout.querySelector('.toc-percentage')
      isExpand = $cardToc.classList.contains('is-expand')

      window.mobileToc = {
        open: () => {
          $cardTocLayout.style.cssText = 'animation: toc-open .3s; opacity: 1; right: 55px'
        },

        close: () => {
          $cardTocLayout.style.animation = 'toc-close .2s'
          setTimeout(() => {
            $cardTocLayout.style.cssText = "opacity:''; animation: ''; right: ''"
          }, 100)
        }
      }

      // toc元素點擊
      $cardToc.addEventListener('click', e => {
        e.preventDefault()
        const target = e.target.classList
        if (target.contains('toc-content')) return
        const $target = target.contains('toc-link')
          ? e.target
          : e.target.parentElement
        btf.scrollToDest(btf.getEleTop(document.getElementById(decodeURI($target.getAttribute('href')).replace('#', ''))), 300)
        if (window.innerWidth < 900) {
          window.mobileToc.close()
        }
      })

      autoScrollToc = item => {
        const activePosition = item.getBoundingClientRect().top
        const sidebarScrollTop = $cardToc.scrollTop
        if (activePosition > (document.documentElement.clientHeight - 100)) {
          $cardToc.scrollTop = sidebarScrollTop + 150
        }
        if (activePosition < 100) {
          $cardToc.scrollTop = sidebarScrollTop - 150
        }
      }
    }

    // find head position & add active class
    const list = $article.querySelectorAll('h1,h2,h3,h4,h5,h6')
    let detectItem = ''
    const findHeadPosition = function (top) {
      if (top === 0) {
        return false
      }

      let currentId = ''
      let currentIndex = ''

      list.forEach(function (ele, index) {
        if (top > btf.getEleTop(ele) - 80) {
          const id = ele.id
          currentId = id ? '#' + encodeURI(id) : ''
          currentIndex = index
        }
      })

      if (detectItem === currentIndex) return

      if (isAnchor) btf.updateAnchor(currentId)

      detectItem = currentIndex

      if (isToc) {
        $cardToc.querySelectorAll('.active').forEach(i => { i.classList.remove('active') })

        if (currentId === '') {
          return
        }

        const currentActive = $tocLink[currentIndex]
        currentActive.classList.add('active')

        setTimeout(() => {
          autoScrollToc(currentActive)
        }, 0)

        if (isExpand) return
        let parent = currentActive.parentNode

        for (; !parent.matches('.toc'); parent = parent.parentNode) {
          if (parent.matches('li')) parent.classList.add('active')
        }
      }
    }

    // main of scroll
    window.tocScrollFn = btf.throttle(() => {
      const currentTop = window.scrollY || document.documentElement.scrollTop
      if (isToc && GLOBAL_CONFIG.percent.toc) {
        $tocPercentage.textContent = btf.getScrollPercent(currentTop, $article)
      }
      findHeadPosition(currentTop)
    }, 100)

    window.addEventListener('scroll', tocScrollFn)
  }

  const modeChangeFn = mode => {
    if (!window.themeChange) {
      return
    }

    const turnMode = item => window.themeChange[item](mode)

    Object.keys(window.themeChange).forEach(item => {
      if (['disqus', 'disqusjs'].includes(item)) {
        setTimeout(() => turnMode(item), 300)
      } else {
        turnMode(item)
      }
    })
  }

  /**
   * Rightside
   */
  const rightSideFn = {
    switchReadMode: () => { // read-mode
      const $body = document.body
      $body.classList.add('read-mode')
      const newEle = document.createElement('button')
      newEle.type = 'button'
      newEle.className = 'fas fa-sign-out-alt exit-readmode'
      $body.appendChild(newEle)

      const clickFn = () => {
        $body.classList.remove('read-mode')
        newEle.remove()
        newEle.removeEventListener('click', clickFn)
      }

      newEle.addEventListener('click', clickFn)
    },
    switchDarkMode: () => { // Switch Between Light And Dark Mode
      const willChangeMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
      if (willChangeMode === 'dark') {
        activateDarkMode()
        saveToLocal.set('theme', 'dark', 2)
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
      } else {
        activateLightMode()
        saveToLocal.set('theme', 'light', 2)
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
      }
      modeChangeFn(willChangeMode)
    },
    showOrHideBtn: (e) => { // rightside 點擊設置 按鈕 展開
      const rightsideHideClassList = document.getElementById('rightside-config-hide').classList
      rightsideHideClassList.toggle('show')
      if (e.classList.contains('show')) {
        rightsideHideClassList.add('status')
        setTimeout(() => {
          rightsideHideClassList.remove('status')
        }, 300)
      }
      e.classList.toggle('show')
    },
    scrollToTop: () => { // Back to top
      btf.scrollToDest(0, 500)
    },
    hideAsideBtn: () => { // Hide aside
      const $htmlDom = document.documentElement.classList
      const saveStatus = $htmlDom.contains('hide-aside') ? 'show' : 'hide'
      saveToLocal.set('aside-status', saveStatus, 2)
      $htmlDom.toggle('hide-aside')
    },
    runMobileToc: () => {
      if (window.getComputedStyle(document.getElementById('card-toc')).getPropertyValue('opacity') === '0') window.mobileToc.open()
      else window.mobileToc.close()
    },
    toggleChatDisplay: () => {
      window.chatBtnFn()
    }
  }

  document.getElementById('rightside').addEventListener('click', function (e) {
    const $target = e.target.id ? e.target : e.target.parentNode
    switch ($target.id) {
      case 'go-up':
        rightSideFn.scrollToTop()
        break
      case 'rightside_config':
        rightSideFn.showOrHideBtn($target)
        break
      case 'mobile-toc-button':
        rightSideFn.runMobileToc()
        break
      case 'readmode':
        rightSideFn.switchReadMode()
        break
      case 'darkmode':
        rightSideFn.switchDarkMode()
        break
      case 'hide-aside-btn':
        rightSideFn.hideAsideBtn()
        break
      case 'chat-btn':
        rightSideFn.toggleChatDisplay()
        break
      default:
        break
    }
  })

  /**
   * menu
   * 側邊欄sub-menu 展開/收縮
   */
  const clickFnOfSubMenu = () => {
    document.querySelectorAll('#sidebar-menus .site-page.group').forEach(function (item) {
      item.addEventListener('click', function () {
        this.classList.toggle('hide')
      })
    })
  }

  /**
 * 複製時加上版權信息
 */
  const addCopyright = () => {
    const copyright = GLOBAL_CONFIG.copyright
    document.body.oncopy = (e) => {
      e.preventDefault()
      const copyFont = window.getSelection(0).toString()
      let textFont = copyFont
      if (copyFont.length > copyright.limitCount) {
        textFont = `${copyFont}\n\n\n${copyright.languages.author}\n${copyright.languages.link}${window.location.href}\n${copyright.languages.source}\n${copyright.languages.info}`
      }
      if (e.clipboardData) {
        return e.clipboardData.setData('text', textFont)
      } else {
        return window.clipboardData.setData('text', textFont)
      }
    }
  }

  /**
   * 網頁運行時間
   */
  const addRuntime = () => {
    const $runtimeCount = document.getElementById('runtimeshow')
    if ($runtimeCount) {
      const publishDate = $runtimeCount.getAttribute('data-publishDate')
      $runtimeCount.textContent = `${btf.diffDate(publishDate)} ${GLOBAL_CONFIG.runtime}`
    }
  }

  /**
   * 最後一次更新時間
   */
  const addLastPushDate = () => {
    const $lastPushDateItem = document.getElementById('last-push-date')
    if ($lastPushDateItem) {
      const lastPushDate = $lastPushDateItem.getAttribute('data-lastPushDate')
      $lastPushDateItem.textContent = btf.diffDate(lastPushDate, true)
    }
  }

  /**
   * table overflow
   */
  const addTableWrap = () => {
    const $table = document.querySelectorAll('#article-container :not(.highlight) > table, #article-container > table')
    if ($table.length) {
      $table.forEach(item => {
        btf.wrap(item, 'div', { class: 'table-wrap' })
      })
    }
  }

  /**
   * tag-hide
   */
  const clickFnOfTagHide = function () {
    const $hideInline = document.querySelectorAll('#article-container .hide-button')
    if ($hideInline.length) {
      $hideInline.forEach(function (item) {
        item.addEventListener('click', function (e) {
          const $this = this
          $this.classList.add('open')
          const $fjGallery = $this.nextElementSibling.querySelectorAll('.fj-gallery')
          $fjGallery.length && btf.initJustifiedGallery($fjGallery)
        })
      })
    }
  }

  const tabsFn = {
    clickFnOfTabs: function () {
      document.querySelectorAll('#article-container .tab > button').forEach(function (item) {
        item.addEventListener('click', function (e) {
          const $this = this
          const $tabItem = $this.parentNode

          if (!$tabItem.classList.contains('active')) {
            const $tabContent = $tabItem.parentNode.nextElementSibling
            const $siblings = btf.siblings($tabItem, '.active')[0]
            $siblings && $siblings.classList.remove('active')
            $tabItem.classList.add('active')
            const tabId = $this.getAttribute('data-href').replace('#', '')
            const childList = [...$tabContent.children]
            childList.forEach(item => {
              if (item.id === tabId) item.classList.add('active')
              else item.classList.remove('active')
            })
            const $isTabJustifiedGallery = $tabContent.querySelectorAll(`#${tabId} .fj-gallery`)
            if ($isTabJustifiedGallery.length > 0) {
              btf.initJustifiedGallery($isTabJustifiedGallery)
            }
          }
        })
      })
    },
    backToTop: () => {
      document.querySelectorAll('#article-container .tabs .tab-to-top').forEach(function (item) {
        item.addEventListener('click', function () {
          btf.scrollToDest(btf.getEleTop(btf.getParents(this, '.tabs')), 300)
        })
      })
    }
  }

  const toggleCardCategory = function () {
    const $cardCategory = document.querySelectorAll('#aside-cat-list .card-category-list-item.parent i')
    if ($cardCategory.length) {
      $cardCategory.forEach(function (item) {
        item.addEventListener('click', function (e) {
          e.preventDefault()
          const $this = this
          $this.classList.toggle('expand')
          const $parentEle = $this.parentNode.nextElementSibling
          if (btf.isHidden($parentEle)) {
            $parentEle.style.display = 'block'
          } else {
            $parentEle.style.display = 'none'
          }
        })
      })
    }
  }

  const switchComments = function () {
    let switchDone = false
    const $switchBtn = document.querySelector('#comment-switch > .switch-btn')
    $switchBtn && $switchBtn.addEventListener('click', function () {
      this.classList.toggle('move')
      document.querySelectorAll('#post-comment > .comment-wrap > div').forEach(function (item) {
        if (btf.isHidden(item)) {
          item.style.cssText = 'display: block;animation: tabshow .5s'
        } else {
          item.style.cssText = "display: none;animation: ''"
        }
      })

      if (!switchDone && typeof loadOtherComment === 'function') {
        switchDone = true
        loadOtherComment()
      }
    })
  }

  const addPostOutdateNotice = function () {
    const data = GLOBAL_CONFIG.noticeOutdate
    const diffDay = btf.diffDate(GLOBAL_CONFIG_SITE.postUpdate)
    if (diffDay >= data.limitDay) {
      const ele = document.createElement('div')
      ele.className = 'post-outdate-notice'
      ele.textContent = data.messagePrev + ' ' + diffDay + ' ' + data.messageNext
      const $targetEle = document.getElementById('article-container')
      if (data.position === 'top') {
        $targetEle.insertBefore(ele, $targetEle.firstChild)
      } else {
        $targetEle.appendChild(ele)
      }
    }
  }

  const lazyloadImg = () => {
    window.lazyLoadInstance = new LazyLoad({
      elements_selector: 'img',
      threshold: 0,
      data_src: 'lazy-src'
    })
  }

  const relativeDate = function (selector) {
    selector.forEach(item => {
      const timeVal = item.getAttribute('datetime')
      item.textContent = btf.diffDate(timeVal, true)
      item.style.display = 'inline'
    })
  }

  const unRefreshFn = function () {
    window.addEventListener('resize', () => {
      adjustMenu(false)
      btf.isHidden(document.getElementById('toggle-menu')) && mobileSidebarOpen && sidebarFn.close()
    })

    document.getElementById('menu-mask').addEventListener('click', e => { sidebarFn.close() })

    clickFnOfSubMenu()
    GLOBAL_CONFIG.islazyload && lazyloadImg()
    GLOBAL_CONFIG.copyright !== undefined && addCopyright()

    if (GLOBAL_CONFIG.autoDarkmode) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (saveToLocal.get('theme') !== undefined) return
        e.matches ? modeChangeFn('dark') : modeChangeFn('light')
      })
    }
  }

  window.refreshFn = function () {
    initAdjust()

    if (GLOBAL_CONFIG_SITE.isPost) {
      GLOBAL_CONFIG.noticeOutdate !== undefined && addPostOutdateNotice()
      GLOBAL_CONFIG.relativeDate.post && relativeDate(document.querySelectorAll('#post-meta time'))
    } else {
      GLOBAL_CONFIG.relativeDate.homepage && relativeDate(document.querySelectorAll('#recent-posts time'))
      GLOBAL_CONFIG.runtime && addRuntime()
      addLastPushDate()
      toggleCardCategory()
    }

    scrollFnToDo()
    GLOBAL_CONFIG_SITE.isHome && scrollDownInIndex()
    addHighlightTool()
    GLOBAL_CONFIG.isPhotoFigcaption && addPhotoFigcaption()
    scrollFn()

    const $jgEle = document.querySelectorAll('#article-container .fj-gallery')
    $jgEle.length && runJustifiedGallery($jgEle)

    runLightbox()
    addTableWrap()
    clickFnOfTagHide()
    tabsFn.clickFnOfTabs()
    tabsFn.backToTop()
    switchComments()
    document.getElementById('toggle-menu').addEventListener('click', () => { sidebarFn.open() })
  }

  refreshFn()
  unRefreshFn()
})
