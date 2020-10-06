<template>
  <el-container class="home-comtainer">
    <el-header>
      <div>
        <img src="../assets/4f10ebdeb60d7840099a69bdefbfac6a.jpg" alt="" />
        <span>電商後台管理系統</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <el-container>
      <el-aside :width="isCollapse ? '64px': '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>

        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" 
                :unique-opened="true" :collapse="isCollapse" :collapse-transition="false "
                router :default-active="activePath"
                >
          <!-- 一級菜單 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id" >
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+ subItem.path" v-for="subItem in item.children" :key="subItem.id" 
              @click="saveNavState('/'+ subItem.path)"
            > 
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
            </template>
            </el-menu-item>
           
          </el-submenu>
          
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconsObj: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-3702mima',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao',
      },
      // 是否折叠
      isCollapse:false,
      // 被激活的链接地址
      activePath:'',

    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('login')
    },
    // 获取所有菜单
    async getMeunList() {
      const {data: res} = await this.$http.get('menus')
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    // 点击切换 折叠展开
    toggleCollapse(){ 
      this.isCollapse = !this.isCollapse
    },
    // 保持激活状态
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },

  created() {
    this.getMeunList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
}
</script>

<style lang="less" scoped>
.home-comtainer {
  height: 100%;
}
.el-header {
  display: flex;
  background-color: #2b4b6b;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    img {
      margin-left: 15px;
      width: 50px;
      border-radius: 50%;
      border: 3px solid #fff;
    }
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  box-sizing: border-box;
  background-color: #333744;
  .el-menu {
    border-right:none;
  }
}

.el-main {
  background-color: #e9eef3;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button{
  background-color: #4a5064;
  color: #fff;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
