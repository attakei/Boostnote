import React, { PropTypes } from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './Main.styl'
import { connect } from 'react-redux'
import SideNav from './SideNav'
import TopBar from './TopBar'
import NoteList from './NoteList'
import Detail from './Detail'
import dataApi from 'browser/main/lib/dataApi'
import StatusBar from './StatusBar'
import _ from 'lodash'
import ConfigManager from 'browser/main/lib/ConfigManager'
import modal from 'browser/main/lib/modal'
import InitModal from 'browser/main/modals/InitModal'

class Main extends React.Component {
  constructor (props) {
    super(props)

    let { config } = props

    this.state = {
      isRightSliderFocused: false,
      listWidth: config.listWidth,
      navWidth: config.listWidth,
      isLeftSliderFocused: false
    }
  }

  componentDidMount () {
    let { dispatch, config } = this.props

    if (config.ui.theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark')
    } else {
      document.body.setAttribute('data-theme', 'default')
    }

    // Reload all data
    dataApi.init()
      .then((data) => {
        dispatch({
          type: 'INIT_ALL',
          storages: data.storages,
          notes: data.notes
        })

        if (data.storages.length < 1) {
          modal.open(InitModal)
        }
      })
  }

  handleLeftSlideMouseDown (e) {
    e.preventDefault()
    this.setState({
      isLeftSliderFocused: true
    })
  }

  handleRightSlideMouseDown (e) {
    e.preventDefault()
    this.setState({
      isRightSliderFocused: true
    })
  }

  handleMouseUp (e) {
    if (this.state.isRightSliderFocused) {
      this.setState({
        isRightSliderFocused: false
      }, () => {
        let { dispatch } = this.props
        let newListWidth = this.state.listWidth
        // TODO: ConfigManager should dispatch itself.
        ConfigManager.set({listWidth: newListWidth})
        dispatch({
          type: 'SET_LIST_WIDTH',
          listWidth: newListWidth
        })
      })
    }
    if (this.state.isLeftSliderFocused) {
      this.setState({
        isLeftSliderFocused: false
      }, () => {
        let { dispatch } = this.props
        let navWidth = this.state.navWidth
        // TODO: ConfigManager should dispatch itself.
        ConfigManager.set({listWidth: navWidth})
        dispatch({
          type: 'SET_NAV_WIDTH',
          listWidth: navWidth
        })
      })
    }
  }

  handleMouseMove (e) {
    if (this.state.isRightSliderFocused) {
      let offset = this.refs.body.getBoundingClientRect().left
      let newListWidth = e.pageX - offset
      if (newListWidth < 10) {
        newListWidth = 10
      } else if (newListWidth > 600) {
        newListWidth = 600
      }
      this.setState({
        listWidth: newListWidth
      })
    }
    if (this.state.isLeftSliderFocused) {
      let navWidth = e.pageX
      if (navWidth < 80) {
        navWidth = 80
      } else if (navWidth > 600) {
        navWidth = 600
      }
      this.setState({
        navWidth: navWidth
      })
    }
  }

  render () {
    let { config } = this.props

    return (
      <div
        className='Main'
        styleName='root'
        onMouseMove={(e) => this.handleMouseMove(e)}
        onMouseUp={(e) => this.handleMouseUp(e)}
      >
        <SideNav
          {..._.pick(this.props, [
            'dispatch',
            'data',
            'config',
            'location'
          ])}
          width={this.state.navWidth}
        />
        {!config.isSideNavFolded &&
          <div styleName={this.state.isLeftSliderFocused ? 'slider--active' : 'slider'}
            style={{left: this.state.navWidth - 1}}
            onMouseDown={(e) => this.handleLeftSlideMouseDown(e)}
            draggable='false'
          >
            <div styleName='slider-hitbox'/>
          </div>
        }
        <div styleName={config.isSideNavFolded ? 'body--expanded' : 'body'}
          ref='body'
          style={{left: config.isSideNavFolded ? 44 : this.state.navWidth}}
        >
          <TopBar style={{width: this.state.listWidth}}
            {..._.pick(this.props, [
              'dispatch',
              'config',
              'data',
              'params',
              'location'
            ])}
          />
          <NoteList style={{width: this.state.listWidth}}
            {..._.pick(this.props, [
              'dispatch',
              'data',
              'config',
              'params',
              'location'
            ])}
          />
          <div styleName={this.state.isRightSliderFocused ? 'slider--active' : 'slider'}
            style={{left: this.state.listWidth}}
            onMouseDown={(e) => this.handleRightSlideMouseDown(e)}
            draggable='false'
          >
            <div styleName='slider-hitbox'/>
          </div>
          <Detail
            style={{left: this.state.listWidth + 1}}
            {..._.pick(this.props, [
              'dispatch',
              'data',
              'config',
              'params',
              'location'
            ])}
            ignorePreviewPointerEvents={this.state.isRightSliderFocused}
          />
        </div>
        <StatusBar
          {..._.pick(this.props, ['config', 'location', 'dispatch'])}
        />
      </div>
    )
  }
}

Main.propTypes = {
  dispatch: PropTypes.func,
  data: PropTypes.shape({}).isRequired
}

export default connect((x) => x)(CSSModules(Main, styles))
