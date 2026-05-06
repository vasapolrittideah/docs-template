import * as Button from '@/components/common/button';
import * as Dropdown from '@/components/common/dropdown';
import { RiCheckLine } from '@remixicon/react';

const DocsSwitcher = () => {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button.Root variant="neutral" mode="stroke" size="xsmall">
          <div className="flex max-w-56 items-center">
            <p className="truncate text-sm">User Guide</p>
          </div>
        </Button.Root>
      </Dropdown.Trigger>
      <Dropdown.Content align="start" className="w-72 p-2">
        <Dropdown.Item className="text-text-sub-600 hover:text-text-strong-950 bg-bg-weak-50">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-text-strong-950 font-medium">User Guide</span>
              <span className="truncate text-xs">Learn how to get started</span>
            </div>
            <RiCheckLine size={20} className="shrink-0" />
          </div>
        </Dropdown.Item>
        <Dropdown.Item className="text-text-sub-600 hover:text-text-strong-950">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-text-strong-950 font-medium">API Reference</span>
              <span className="truncate text-xs">Detailed information about our API</span>
            </div>
            <RiCheckLine size={20} className="shrink-0 opacity-0" />
          </div>
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

export default DocsSwitcher;
