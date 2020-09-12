<template>
    <div id="board">

        <!--头部-->
        <t-header></t-header>

        <!--正文-->
        <main v-if="board">
            <div class="board-header">
            <!-- <h2  contenteditable="true" :style="{color:color}" class="form-field-input h2" ref="newBoardName" @blur="editBoardName" @focus="changeColor"> {{board.name}} </h2> -->
                <!-- <textarea :style="{color:color}" class="form-field-input h2" ref="newBoardName" @blur="editBoardName" @focus="changeColor">{{board.name}}</textarea> -->
                <input :style="{color:color}" class="form-field-input h2" ref="newBoardName" @blur="editBoardName" @focus="changeColor" :value="board.name" />
                
                <t-popup title="菜单" ref="tPopup">
                    <a href="javascript:void(0)" class="btn btn-icon menu">
                        <i class="icon icon-more"></i>
                        <span class="txt">显示菜单</span>
                    </a>
    
                    <t-popup-menu slot="content" :items="menuItems" @command="execute"></t-popup-menu>
                </t-popup>
                
            </div>
                
            <!--面板容器-->
            <div class="board">


                <!--面板列表容器-->
                <t-list
                    v-for="list of lists"
                    :key="list.id"
                    :data="list"

                    @dragStart="dragStart"
                    @dragMove="dragMove"
                    @dragEnd="dragEnd"
                ></t-list>

                <!--无内容列表容器-->
                <div class="list-wrap no-content" :class="{'list-adding': listAdding}">

                    <div class="list-add" @click="showListAdding">
                        <span class="icon icon-add"></span>
                        <span>添加另一个列表</span>
                    </div>

                    <div class="list">

                        <div class="list-cards">
                            <div class="list-card-add-form">
                                <input class="form-field-input" ref="newListName" placeholder="为这张卡片添加标题……" />
                            </div>
                        </div>

                        <div class="list-footer">
                            <div class="list-add-confirm">
                                <button class="btn btn-success" @click="addNewList">添加列表</button>
                                <span class="icon icon-close" @click="hideListAdding"></span>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

        </main>


        <router-view></router-view>

    </div>
</template>


<script>
    import THeader from "@/components/THeader";
    import TList from '@/components/TList';
    import TPopup from "@/components/TPopup";
    import TPopupMenu from "@/components/TPopupMenu";

    export default {
        name: 'Board',

        components: {
            THeader,
            TList,
            TPopup,
            TPopupMenu
        },

        data() {
            return {
                listAdding: false,
                color: '#fff',
                menuItems: [
                    {name: '删除面板', command: 'delBoard'}
                ]
            }
        },

        computed: {
            board() {
                return this.$store.getters['board/getBoard'](this.$route.params.id);
            },
            lists() {
                return this.$store.getters['list/getLists'](this.$route.params.id);
            }
        },

        created() {
            if (!this.board) {
                this.$store.dispatch('board/getBoard', this.$route.params.id);
            }
            if (!this.lists.length) {
                this.$store.dispatch('list/getLists', this.$route.params.id);
            }
        },

        methods: {
            // 显示添加列表的结构
            showListAdding() {
                this.listAdding = true;
                this.$nextTick(() => {
                    this.$refs.newListName.focus();
                });
            },
            // 隐藏添加列表的结构
            hideListAdding() {
                this.listAdding = false;
            },
            // 提交添加新的列表
            addNewList() {
                let name = this.$refs.newListName.value;

                if (name.trim() === '') {
                    this.$refs.newListName.focus();
                } else {
                    try {
                        this.$store.dispatch('list/postList', {
                            boardId: this.board.id,
                            name
                        });

                        this.$message.success('提交成功');
                        this.$refs.newListName.value = '';
                        this.listAdding = true;
                    } catch (e) {}
                }
            },

            // 拖拽
            dragStart(e) {
                let el = e.component.$el;
                let board = el.parentNode;
                let lists = [...board.querySelectorAll('.list-wrap')];
                el._index = lists.findIndex(list => list === el);
            },
            dragMove(e) {
                let el = e.component.$el;
                let board = el.parentNode;
                let lists = [...board.querySelectorAll('.list-wrap')];
                let currentIndex = lists.findIndex( list => list === el );

                lists.forEach( (list, index) => {
                    if ( index !== currentIndex  ) {
                        let clientRect = list.getBoundingClientRect();
                        if (
                            e.x >= clientRect.left
                            &&
                            e.x <= clientRect.right
                            &&
                            e.y >= clientRect.top
                            &&
                            e.y <= clientRect.bottom
                        ) {
                            if (currentIndex < index) {
                                board.insertBefore(el, list.nextElementSibling);
                            } else {
                                board.insertBefore(el, list);
                            }
                        }
                    }
                } );
            },
            async dragEnd(e) {

                let el = e.component.$el;
                let board = el.parentNode;
                let lists = [...board.querySelectorAll('.list-wrap-content')];
                let currentIndex = lists.findIndex(list => list === el);

                // 判断一下当前这个元素是否移动了
                // console.log(el._index, currentIndex);
                if (el._index !== currentIndex) {

                    let newOrder;

                    // 获取当前所在位置的上一个列表和下一个列表的order值
                    let prevOrder = lists[currentIndex - 1] && parseFloat( lists[currentIndex - 1].dataset.order );
                    let nextOrder = lists[currentIndex + 1] && parseFloat( lists[currentIndex + 1].dataset.order );

                    // console.log(prevOrder, nextOrder);
                    if (currentIndex === 0) {
                        newOrder = nextOrder / 2;
                    } else if (currentIndex === lists.length - 1) {
                        newOrder = prevOrder + 65535;
                    } else {
                        newOrder = prevOrder + (nextOrder - prevOrder) / 2;
                    }

                    await this.$store.dispatch('list/editList', {
                        boardId: this.board.id,
                        id: e.component.data.id,
                        order: newOrder
                    })

                }

            },
            async editBoardName(){
                console.log('编辑',this.board.id);
                this.color = '#fff';
                let {value, innerHTML} = this.$refs.newBoardName;
                if (value !== innerHTML) {
                    await this.$store.dispatch('board/putBoard', {
                        id: this.board.id,
                        name: value
                    })
                }
                
            },
            changeColor(){
                this.color = '#000';
            },
            execute(command) {
                switch (command) {
                    case 'delBoard':
                        this.delBoard();
                        break;
                    default:
                        break;
                }
            },
            async delBoard(){
                console.log('delBoard');
                await this.$store.dispatch('board/deleteBoard', {
                    id: this.board.id,
                    });

                this.$message.success('删除成功');
                this.$router.push({ name: 'Home'});
            }
        }
    }
</script>

<style scoped>
    .container{
        *zoom: 1;
        
    }
    .h2{
        font-size: 20px;
        margin: 5px 0;
        width: 300px;
        display:inline-block;
    }
    .board-header {
        flex: 1;
        display: flex;
        justify-content: space-between;
    }
    .menu {
        top: 3px;
    }
</style>