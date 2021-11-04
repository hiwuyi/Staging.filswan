<template>
    <div class="wrapper">
        <v-head></v-head>
        <v-sidebar></v-sidebar>
        <div class="content-box" id="content-box" :class="{'content-collapse':collapseP}">
            <div id="headerMb" v-if="bodyWidth">
                <div class="headerMb" v-if="email">
                    {{headertitle}}
                </div>
            </div>
            <div class="content">
                <transition name="move" mode="out-in">
                    <keep-alive :include="tagsList">
                        <router-view></router-view>
                    </keep-alive>
                </transition>
                <el-backtop target=".content"></el-backtop>
            </div>
        </div>
    </div>
</template>

<script>
import vHead from './Header.vue';
import vSidebar from './Sidebar.vue';
// import bus from './bus';
export default {
    data() {
        return {
            tagsList: [],
            collapse: false,
            collapseP: this.$store.getters.collapseL == 'true'||this.$store.getters.collapseL==true?true: false,
            bodyWidth: document.body.clientWidth<1024?true:false,
            tabshow: localStorage.getItem('tabTask_name') == 'User_Profile'?true:false
        };
    },
    components: {
        vHead,
        vSidebar
    },
    computed: {
        headertitle() {
            return this.$store.getters.headertitle
        },
        routerMenu() {
            return this.$store.getters.routerMenu
        },
        email() {
            return this.$store.state.user.email
        },
        collapseL() {
            return this.$store.getters.collapseL
        }
    },
    watch: {
        'collapseL': function(){
            this.collapseP = this.$store.getters.collapseL == 'true'||this.$store.getters.collapseL==true?true: false
        }
    },
    mounted() {
        let bo = this.bodyWidth
        window.onresize = function () {
            if((!bo && document.body.clientWidth<1024) || (bo && document.body.clientWidth>=1024)){
                window.location.reload();
            }
        }
    }
};
</script>

