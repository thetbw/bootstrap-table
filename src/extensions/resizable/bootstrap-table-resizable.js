/**
 * @author: Dennis Hernández
 * @webSite: http://djhvscf.github.io/Blog
 * @version: v2.0.0
 */
const DATA_COLUMNS_ID = 'resizable-columns-id'
const DATA_COLUMN_ID = 'resizable-column-id'


const isInit = that => that.$el.data('resizableColumns') !== undefined

/**
 * sync the fixed-table-header size
 */
const syncHeaderWidth = that => {
  // set header size
  const bootstrapHeader = that.$header_.find('tr:first > th:visible')

  that.$header.find('tr:first > th:visible').each((_, th) => {
    bootstrapHeader.eq($(th).index()).width($(th).width())
  })
}

const initResizable = that => {
  if (
    that.options.resizable &&
    !that.options.cardView &&
    !isInit(that) &&
    that.$el.is(':visible')
  ) {
    // resize header
    const onResize = (event, resiable, leftEle, rightEle, leftWidth, rightWidth) => {
      const bootstrapHeader = that.$header_.find('tr:first > th:visible')
      const leftHeaderEle = bootstrapHeader.eq(leftEle.index()).not('[data-noresize]')
      const rightHeaderEle = bootstrapHeader.eq(rightEle.index()).not('[data-noresize]')

      leftHeaderEle.width(leftWidth)
      rightHeaderEle.width(rightWidth)
    }

    // resize header
    const onStop = (event, resiable, leftEle, rightEle, leftWidth, rightWidth) => {
      const bootstrapHeader = that.$header_.find('tr:first > th:visible')
      const leftHeaderEle = bootstrapHeader.eq(leftEle.index()).not('[data-noresize]')
      const rightHeaderEle = bootstrapHeader.eq(rightEle.index()).not('[data-noresize]')

      leftHeaderEle.width(leftWidth)
      rightHeaderEle.width(rightWidth)
    }


    // sync the fixed-table-header size
    syncHeaderWidth(that)

    setTimeout(() => {
      // set serialization id
      that.$header.find('tr:first > th:visible').each((_, th) => {
        $(th).data(DATA_COLUMN_ID, $(th).data('field'))
      })

      that.$el.resizableColumns({
        store: that.resizableStore,
        handleContainer: that.$tableHeader.find('table'),
        resize: onResize,
        stop: onStop
      })
      // sync the fixed-table-header size
      syncHeaderWidth(that)

      // FIXIT: This only applies to my current situation. You may need to modify it according to your situation
      that.$tableHeader.find('table').css('table-layout', 'fixed')
      that.$tableBorder.css('width', 'auto')
    }, 1)
  }
}

const destroy = that => {
  if (isInit(that)) {
    that.$el.data('resizableColumns').destroy()
  }
}

const reInitResizable = that => {
  // FIXME: This only applies to my current situation. You may need to modify it according to your situation
  that.$tableHeader.find('table').css('table-layout', 'auto')
  destroy(that)
  initResizable(that)

  // FIXME: This only applies to my current situation. You may need to modify it according to your situation
  that.$tableHeader.find('table').css('table-layout', 'fixed')
}

$.extend($.fn.bootstrapTable.defaults, {
  resizable: false
})

/**
 * gen uuid
 * @return {string} uuid
 */
const uuid = () => {
  const s = []
  const hexDigits = '0123456789abcdef'

  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'

  return s.join('')
}

$.BootstrapTable = class extends $.BootstrapTable {

  constructor ($table, options) {
    super($table, options)

    /**
     * save the temp width data, when table refresh to restore
     */
    // eslint-disable-next-line no-undef
    this.resizableStore = new Map()
    this.$el.data(DATA_COLUMNS_ID, uuid())
  }

  initBody (...args) {
    super.initBody(...args)

    this.$el.off('column-switch.bs.table page-change.bs.table')
      .on('column-switch.bs.table page-change.bs.table', () => {
        reInitResizable(this)
      })
  }

  toggleView (...args) {
    super.toggleView(...args)

    if (this.options.resizable && this.options.cardView) {
      // Destroy the plugin
      destroy(this)
    }
  }

  resetView (...args) {
    super.resetView(...args)

    if (this.options.resizable) {
      // because in fitHeader function, we use setTimeout(func, 100);
      setTimeout(() => {
        reInitResizable(this)
        // FIXME: This only applies to my current situation. You may need to modify it according to your situation
        this.$el.css('table-layout', 'auto')
      }, 100)
    }
  }
}
