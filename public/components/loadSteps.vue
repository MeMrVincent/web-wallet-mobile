<template>
  <div id="loadSteps" v-if="steps.show">
    <div class="loadSteps YScroll">
      <dl v-for="(item, index) in steps.list" :key="index" class="Flex" tag="LT">
        <dt class="Flex">
          <van-icon name="warning" class="Flex error" v-if="item.error" />
          <van-loading type="spinner" class="Flex" size="25px" color="#1989fa" v-if="!item.error && steps.select === index" />
          <template v-if="steps.select > index">
            <van-icon name="checked" class="Flex success" v-if="!item.error" />
          </template>
          <b class="Flex" v-if="steps.select < index">{{ index + 1 }}</b>
        </dt>
        <dd>{{ getStepLabel(item) }}</dd>
      </dl>
    </div>
    <div>
      {{ $t('field.width') }}: {{ width }}, {{ $t('field.height') }}: {{ height }}
    </div>
    <div class="btn Flex">
      <van-button plain size="small" type="danger" @click="handleAction('close')" v-if="prod !== 'prod' && steps.list && steps.list.length > 0 && steps.select !== steps.list.length">
        {{ $t('button.workflowClose') }}<template v-if="steps.error">, {{ $t('field.error') }} {{ steps.error }}</template>
      </van-button>
      <template v-if="steps.list && steps.list.length > 0 && steps.select === steps.list.length">
        <van-button plain size="small" type="success" @click="handleAction('callBack')" v-if="!steps.error">
          {{ $t('button.workflowOk') }}
        </van-button>
        <van-button plain size="small" type="danger" @click="handleAction('close')" v-if="steps.error">
          {{ $t('button.workflowError') }}, {{ $t('field.error') }} {{ steps.error }}
        </van-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button as VanButton, Icon as VanIcon, Loading as VanLoading } from 'vant';
import $$ from '@App/$$';

const props = defineProps({
  steps: {
    type: Object,
    default: () => ({ select: 0, list: [], show: false, error: 0 }),
  },
});
const emit = defineEmits(['callBack']);
const { t: $t } = useI18n();
const prod = $$.prod;
const width = ref(null);
const height = ref(null);

const getStepLabel = (item) => (item.labelKey ? $t(item.labelKey) : item.label);

const handleAction = (type) => {
  props.steps.show = false;
  if (type === 'callBack') {
    emit(type);
  }
  if (type === 'close') {
    window.location.href = 'uniwebview://close?t=' + new Date().valueOf();
  }
};

onMounted(() => {
  const html = document.documentElement;
  width.value = html.offsetWidth;
  height.value = html.offsetHeight;
});
</script>

<style scoped>
#loadSteps { position: fixed; top:0; left:0; width: 100%; height:100%; z-index: 100; background:#fff; padding:20px; box-sizing: border-box; }

.loadSteps { position:relative; height:calc(100% - 64px + 20px); }
.loadSteps dl { position: relative; padding:8px 0; }
.loadSteps dt { width:25px; height:25px; margin:5px 0 0; }
.loadSteps dt .van-icon,.loadSteps dt b { width:100%; height:100%; font-size:25px; }
.loadSteps dt .van-icon.success { color:rgb(7, 193, 96); }
.loadSteps dt .van-icon.error { color:#f00; }
.loadSteps dt .van-icon.blue { color:#1989fa; }
.loadSteps dt b { box-sizing: border-box; border-radius:100%; border:2px solid #1989fa; font-size:16px; color:#1989fa; font-weight:bold; }
.loadSteps dd { line-height:20px; font-size:14px; padding:10px 0; width: calc(100% - 35px); margin:0 0 0 10px; text-transform: capitalize; }

.btn { position:absolute; left:0; right:0; padding:16px 0; bottom:0; }
.btn .van-button { margin:0 8px; }
</style>
