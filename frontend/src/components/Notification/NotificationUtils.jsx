import {
  IconAlertTriangleFilled,
  IconCircleArrowDownRightFilled,
  IconCircleCheckFilled,
  IconForbidFilled,
  IconHelpHexagonFilled,
  IconInfoCircleFilled
} from '@tabler/icons-react';

export function getIcon(type) {
  switch(type) {
    case 'danger': return <IconForbidFilled />;
    case 'primary': return <IconInfoCircleFilled />;
    case 'secondary': return <IconHelpHexagonFilled />;
    case 'success': return <IconCircleCheckFilled />;
    case 'warning': return <IconAlertTriangleFilled />;
    default: return <IconCircleArrowDownRightFilled />;
  }
}