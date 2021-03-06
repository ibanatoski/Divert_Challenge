import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";

import { Menu, Icon } from 'antd';


class SideBarMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <Menu
        theme="dark"
        mode="vertical"
        defaultSelectedKeys={[this.props.location.pathname]}
        style={{ lineHeight: '64px' }}
        onClick={this.MenuSelect}
      >
        <Menu.Item key="/stores">
          <Link to="/stores"><Icon type="bar-chart" />Stores</Link>
        </Menu.Item>
        <Menu.Item key="/frequency">
          <Link to="/frequency"><Icon type="line-chart" />Frequency</Link>
        </Menu.Item>
        <Menu.Item key="/datahub">
          <Link to="/datahub"><Icon type="line-chart" />Compare Stores</Link>
        </Menu.Item>
        {
        // <Menu.Item key="/performance">
        //   <Link to="/performance"><Icon type="bar-chart" />All Stores</Link>
        // </Menu.Item>
      }
      </Menu>
    );
  }
}

export default withRouter(SideBarMenu);
