import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  from: Date | undefined;
  to: Date | undefined;
  onFromChange: (date: Date | undefined) => void;
  onToChange: (date: Date | undefined) => void;
  className?: string;
}

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closePopover = () => {
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {from && to ? (
              <>
                {format(from, "dd/MM/yyyy", { locale: vi })} -{" "}
                {format(to, "dd/MM/yyyy", { locale: vi })}
              </>
            ) : (
              <span>Chọn khoảng thời gian</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 p-3">
            <div>
              <div className="pb-2 text-sm font-medium">Từ ngày</div>
              <Calendar
                mode="single"
                selected={from}
                onSelect={onFromChange}
                initialFocus
                defaultMonth={from}
                locale={vi}
              />
            </div>
            <div>
              <div className="pb-2 text-sm font-medium">Đến ngày</div>
              <Calendar
                mode="single"
                selected={to}
                onSelect={onToChange}
                initialFocus
                defaultMonth={to}
                locale={vi}
                disabled={(date) => date < (from || new Date())}
              />
            </div>
          </div>
          <div className="p-3 border-t flex justify-end">
            <Button onClick={closePopover} className="px-6">
              Áp dụng
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 