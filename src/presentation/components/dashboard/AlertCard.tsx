import type { FC } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

interface AlertCardProps {
  icon?: React.ElementType;
  borderColor: string;
  bgColor: string;
  iconColor: string;
  title: string;
  description: string;
  linkText: string;
  linkTo: string;
  textColor: string;
  hoverTextColor: string;
}

const AlertCard: FC<AlertCardProps> = ({
  icon: Icon = AlertTriangle,
  borderColor,
  bgColor,
  iconColor,
  title,
  description,
  linkText,
  linkTo,
  textColor,
  hoverTextColor,
}) => {
  return (
    <div className={`${bgColor} border-l-4 ${borderColor} p-4 rounded-r-lg`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${textColor}`}>{title}</h3>
          <div className={`mt-2 text-sm ${textColor}`}>
            <p>{description}</p>
          </div>
          <div className="mt-3">
            <Link
              to={linkTo}
              className={`text-sm font-medium ${textColor} hover:${hoverTextColor}`}
            >
              {linkText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
