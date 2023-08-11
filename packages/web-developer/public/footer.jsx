import { FOOTER_LIST_MAP, MEDIA_LIST } from '@loopring-web/common-resources'

const linkListMap = FOOTER_LIST_MAP
const mediaList = MEDIA_LIST
export const Footer = () => {
  return (
    <div className='footerContent'>
      <div className='wrap Container-maxWidthLg'>
        <div className='Box-root content'>
          <div className='Box-root' id='logSvg'></div>

          {
            // @ts-ignore
            Reflect.ownKeys(linkListMap).map((key) => {
              return (
                <section className='Box-root group'>
                  <h6
                    aria-label={key}
                    className='Typography-root Typography-body2'
                    id={`label${key.charAt(0).toUpperCase() + key.slice(1)}`}
                  ></h6>
                  <ul className='Ul-root'>
                    {linkListMap[key.toString()].map((item) => {
                      return (
                        <li>
                          <a
                            aria-label={item.linkName}
                            className={`Typography-root Typography-inherit ${item.linkName} Link-underlineAlways`}
                            href={item.linkHref}
                            id={`label${item.charAt(0).toUpperCase() + item.slice(1)}`}
                            rel='noopener noreferrer'
                            target='_blank'
                          >
                            {item.linkName}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )
            })
          }
        </div>

        <section className='Box-root group groupIcon'>
          <h6
            aria-label='Follow us'
            className='Typography-root Typography-body2'
            id='labelFollowus'
          >
            Follow us
          </h6>
          <div className='Box-root footerContentList'>
            <ul
              className='List-root List-padding'
              style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 0, paddingBottom: 0 }}
            >
              {mediaList.map((o, index) => (
                <li className='List-root Typography-body1'>
                  <a
                    className='Typography-root Typography-inherit Link-root Link-underlineAlways icon'
                    id={`${o.linkName}Icon`}
                    href={o.linkHref}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {o.linkName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
      <p
        aria-label='@2017 Loopring Technology Limited. All rights reserved.'
        className='Typography-root Typography-body1'
        id='labelCopyRight'
      ></p>
    </div>
  )
}
