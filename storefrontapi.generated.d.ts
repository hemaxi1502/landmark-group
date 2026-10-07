/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type BabyShopMediaImageFragment = Pick<
  StorefrontAPI.MediaImage,
  'id'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
  >;
};

export type BabyShopCardItemFragment = Pick<
  StorefrontAPI.Metaobject,
  'id' | 'handle'
> & {
  fields: Array<
    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MediaImage, 'id'> & {
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
      >;
    }
  >;
};

export type BabyShopBannerItemFragment = Pick<
  StorefrontAPI.Metaobject,
  'id' | 'handle'
> & {
  fields: Array<
    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MediaImage, 'id'> & {
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
      >;
    }
  >;
};

export type BabyShopDataNodeFragment = Pick<
  StorefrontAPI.Metaobject,
  'id' | 'handle'
> & {
  fields: Array<
    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
      reference?: StorefrontAPI.Maybe<
        | (Pick<StorefrontAPI.MediaImage, 'id'> & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          })
        | (Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
            fields: Array<
              Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                reference?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MediaImage, 'id'> & {
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                  }
                >;
              }
            >;
          })
      >;
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
            fields: Array<
              Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                reference?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MediaImage, 'id'> & {
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                  }
                >;
              }
            >;
          }
        >;
      }>;
    }
  >;
};

export type BabyShopMetaobjectFragment = Pick<
  StorefrontAPI.Metaobject,
  'id' | 'handle'
> & {
  fields: Array<
    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metaobject, 'id'> & {
          fields: Array<Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>>;
        }
      >;
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
            fields: Array<
              Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                reference?: StorefrontAPI.Maybe<
                  | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'url' | 'altText' | 'width' | 'height'
                        >
                      >;
                    })
                  | (Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                      fields: Array<
                        Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                          reference?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.MediaImage, 'id'> & {
                              image?: StorefrontAPI.Maybe<
                                Pick<
                                  StorefrontAPI.Image,
                                  'url' | 'altText' | 'width' | 'height'
                                >
                              >;
                            }
                          >;
                        }
                      >;
                    })
                >;
                references?: StorefrontAPI.Maybe<{
                  nodes: Array<
                    Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                      fields: Array<
                        Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                          reference?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.MediaImage, 'id'> & {
                              image?: StorefrontAPI.Maybe<
                                Pick<
                                  StorefrontAPI.Image,
                                  'url' | 'altText' | 'width' | 'height'
                                >
                              >;
                            }
                          >;
                        }
                      >;
                    }
                  >;
                }>;
              }
            >;
          }
        >;
      }>;
    }
  >;
};

export type HomePageBabyShopQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomePageBabyShopQuery = {
  babyShopMetaobject?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
      fields: Array<
        Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
          reference?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metaobject, 'id'> & {
              fields: Array<
                Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
              >;
            }
          >;
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                fields: Array<
                  Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                    reference?: StorefrontAPI.Maybe<
                      | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                          image?: StorefrontAPI.Maybe<
                            Pick<
                              StorefrontAPI.Image,
                              'url' | 'altText' | 'width' | 'height'
                            >
                          >;
                        })
                      | (Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                          fields: Array<
                            Pick<
                              StorefrontAPI.MetaobjectField,
                              'key' | 'value'
                            > & {
                              reference?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.MediaImage, 'id'> & {
                                  image?: StorefrontAPI.Maybe<
                                    Pick<
                                      StorefrontAPI.Image,
                                      'url' | 'altText' | 'width' | 'height'
                                    >
                                  >;
                                }
                              >;
                            }
                          >;
                        })
                    >;
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                          fields: Array<
                            Pick<
                              StorefrontAPI.MetaobjectField,
                              'key' | 'value'
                            > & {
                              reference?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.MediaImage, 'id'> & {
                                  image?: StorefrontAPI.Maybe<
                                    Pick<
                                      StorefrontAPI.Image,
                                      'url' | 'altText' | 'width' | 'height'
                                    >
                                  >;
                                }
                              >;
                            }
                          >;
                        }
                      >;
                    }>;
                  }
                >;
              }
            >;
          }>;
        }
      >;
    }
  >;
  babyShopDataMetaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
            reference?: StorefrontAPI.Maybe<
              | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                })
              | (Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                  fields: Array<
                    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                      reference?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.MediaImage, 'id'> & {
                          image?: StorefrontAPI.Maybe<
                            Pick<
                              StorefrontAPI.Image,
                              'url' | 'altText' | 'width' | 'height'
                            >
                          >;
                        }
                      >;
                    }
                  >;
                })
            >;
            references?: StorefrontAPI.Maybe<{
              nodes: Array<
                Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                  fields: Array<
                    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                      reference?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.MediaImage, 'id'> & {
                          image?: StorefrontAPI.Maybe<
                            Pick<
                              StorefrontAPI.Image,
                              'url' | 'altText' | 'width' | 'height'
                            >
                          >;
                        }
                      >;
                    }
                  >;
                }
              >;
            }>;
          }
        >;
      }
    >;
  };
};

export type HeroSliderSlideFieldsFragment = Pick<
  StorefrontAPI.Metaobject,
  'id' | 'handle' | 'type'
> & {
  fields: Array<
    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MediaImage, 'id'> & {
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
      >;
    }
  >;
};

export type HeroSliderMetaobjectFragment = Pick<
  StorefrontAPI.Metaobject,
  'id' | 'handle' | 'type'
> & {
  fields: Array<
    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MediaImage, 'id'> & {
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
      >;
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          | (Pick<StorefrontAPI.MediaImage, 'id'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
            })
          | (Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
              fields: Array<
                Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                  reference?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MediaImage, 'id'> & {
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'url' | 'altText' | 'width' | 'height'
                        >
                      >;
                    }
                  >;
                }
              >;
            })
        >;
      }>;
    }
  >;
};

export type ShowcaseMediaImageFragment = Pick<
  StorefrontAPI.MediaImage,
  'id'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
  >;
};

export type ShowcaseBannerItemFragment = Pick<
  StorefrontAPI.Metaobject,
  'id' | 'handle'
> & {
  fields: Array<
    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MediaImage, 'id'> & {
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
      >;
    }
  >;
};

export type ShowcaseCardItemFragment = Pick<
  StorefrontAPI.Metaobject,
  'id' | 'handle'
> & {
  fields: Array<
    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MediaImage, 'id'> & {
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
      >;
    }
  >;
};

export type ShowcaseDataNodeFragment = Pick<
  StorefrontAPI.Metaobject,
  'id' | 'handle' | 'type'
> & {
  fields: Array<
    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
      reference?: StorefrontAPI.Maybe<
        | (Pick<StorefrontAPI.MediaImage, 'id'> & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          })
        | (Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
            fields: Array<
              Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                reference?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MediaImage, 'id'> & {
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                  }
                >;
              }
            >;
          })
      >;
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
            fields: Array<
              Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                reference?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MediaImage, 'id'> & {
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                  }
                >;
              }
            >;
          }
        >;
      }>;
    }
  >;
};

export type ShowcaseSectionMetaobjectFragment = Pick<
  StorefrontAPI.Metaobject,
  'id' | 'handle' | 'type'
> & {
  fields: Array<
    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
      reference?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metaobject, 'id'> & {
          fields: Array<Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>>;
        }
      >;
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
            fields: Array<
              Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                reference?: StorefrontAPI.Maybe<
                  | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'url' | 'altText' | 'width' | 'height'
                        >
                      >;
                    })
                  | (Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                      fields: Array<
                        Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                          reference?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.MediaImage, 'id'> & {
                              image?: StorefrontAPI.Maybe<
                                Pick<
                                  StorefrontAPI.Image,
                                  'url' | 'altText' | 'width' | 'height'
                                >
                              >;
                            }
                          >;
                        }
                      >;
                    })
                >;
                references?: StorefrontAPI.Maybe<{
                  nodes: Array<
                    Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                      fields: Array<
                        Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                          reference?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.MediaImage, 'id'> & {
                              image?: StorefrontAPI.Maybe<
                                Pick<
                                  StorefrontAPI.Image,
                                  'url' | 'altText' | 'width' | 'height'
                                >
                              >;
                            }
                          >;
                        }
                      >;
                    }
                  >;
                }>;
              }
            >;
          }
        >;
      }>;
    }
  >;
};

export type HomePageSectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomePageSectionsQuery = {
  homePageSections: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
            reference?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metaobject, 'id'> & {
                fields: Array<
                  Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
                >;
              }
            >;
            references?: StorefrontAPI.Maybe<{
              nodes: Array<
                Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
                  fields: Array<
                    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                      reference?: StorefrontAPI.Maybe<
                        | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                            image?: StorefrontAPI.Maybe<
                              Pick<
                                StorefrontAPI.Image,
                                'url' | 'altText' | 'width' | 'height'
                              >
                            >;
                          })
                        | (Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                            fields: Array<
                              Pick<
                                StorefrontAPI.MetaobjectField,
                                'key' | 'value'
                              > & {
                                reference?: StorefrontAPI.Maybe<
                                  Pick<StorefrontAPI.MediaImage, 'id'> & {
                                    image?: StorefrontAPI.Maybe<
                                      Pick<
                                        StorefrontAPI.Image,
                                        'url' | 'altText' | 'width' | 'height'
                                      >
                                    >;
                                  }
                                >;
                              }
                            >;
                          })
                      >;
                      references?: StorefrontAPI.Maybe<{
                        nodes: Array<
                          Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                            fields: Array<
                              Pick<
                                StorefrontAPI.MetaobjectField,
                                'key' | 'value'
                              > & {
                                reference?: StorefrontAPI.Maybe<
                                  Pick<StorefrontAPI.MediaImage, 'id'> & {
                                    image?: StorefrontAPI.Maybe<
                                      Pick<
                                        StorefrontAPI.Image,
                                        'url' | 'altText' | 'width' | 'height'
                                      >
                                    >;
                                  }
                                >;
                              }
                            >;
                          }
                        >;
                      }>;
                    }
                  >;
                }
              >;
            }>;
          }
        >;
      }
    >;
  };
};

export type HomePageShowcaseSectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomePageShowcaseSectionsQuery = {
  bestsellers?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
      fields: Array<
        Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
          reference?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metaobject, 'id'> & {
              fields: Array<
                Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
              >;
            }
          >;
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
                fields: Array<
                  Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                    reference?: StorefrontAPI.Maybe<
                      | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                          image?: StorefrontAPI.Maybe<
                            Pick<
                              StorefrontAPI.Image,
                              'url' | 'altText' | 'width' | 'height'
                            >
                          >;
                        })
                      | (Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                          fields: Array<
                            Pick<
                              StorefrontAPI.MetaobjectField,
                              'key' | 'value'
                            > & {
                              reference?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.MediaImage, 'id'> & {
                                  image?: StorefrontAPI.Maybe<
                                    Pick<
                                      StorefrontAPI.Image,
                                      'url' | 'altText' | 'width' | 'height'
                                    >
                                  >;
                                }
                              >;
                            }
                          >;
                        })
                    >;
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                          fields: Array<
                            Pick<
                              StorefrontAPI.MetaobjectField,
                              'key' | 'value'
                            > & {
                              reference?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.MediaImage, 'id'> & {
                                  image?: StorefrontAPI.Maybe<
                                    Pick<
                                      StorefrontAPI.Image,
                                      'url' | 'altText' | 'width' | 'height'
                                    >
                                  >;
                                }
                              >;
                            }
                          >;
                        }
                      >;
                    }>;
                  }
                >;
              }
            >;
          }>;
        }
      >;
    }
  >;
  topBrands?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
      fields: Array<
        Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
          reference?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metaobject, 'id'> & {
              fields: Array<
                Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
              >;
            }
          >;
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
                fields: Array<
                  Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                    reference?: StorefrontAPI.Maybe<
                      | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                          image?: StorefrontAPI.Maybe<
                            Pick<
                              StorefrontAPI.Image,
                              'url' | 'altText' | 'width' | 'height'
                            >
                          >;
                        })
                      | (Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                          fields: Array<
                            Pick<
                              StorefrontAPI.MetaobjectField,
                              'key' | 'value'
                            > & {
                              reference?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.MediaImage, 'id'> & {
                                  image?: StorefrontAPI.Maybe<
                                    Pick<
                                      StorefrontAPI.Image,
                                      'url' | 'altText' | 'width' | 'height'
                                    >
                                  >;
                                }
                              >;
                            }
                          >;
                        })
                    >;
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                          fields: Array<
                            Pick<
                              StorefrontAPI.MetaobjectField,
                              'key' | 'value'
                            > & {
                              reference?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.MediaImage, 'id'> & {
                                  image?: StorefrontAPI.Maybe<
                                    Pick<
                                      StorefrontAPI.Image,
                                      'url' | 'altText' | 'width' | 'height'
                                    >
                                  >;
                                }
                              >;
                            }
                          >;
                        }
                      >;
                    }>;
                  }
                >;
              }
            >;
          }>;
        }
      >;
    }
  >;
  festiveEdit?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
      fields: Array<
        Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
          reference?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metaobject, 'id'> & {
              fields: Array<
                Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
              >;
            }
          >;
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
                fields: Array<
                  Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                    reference?: StorefrontAPI.Maybe<
                      | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                          image?: StorefrontAPI.Maybe<
                            Pick<
                              StorefrontAPI.Image,
                              'url' | 'altText' | 'width' | 'height'
                            >
                          >;
                        })
                      | (Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                          fields: Array<
                            Pick<
                              StorefrontAPI.MetaobjectField,
                              'key' | 'value'
                            > & {
                              reference?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.MediaImage, 'id'> & {
                                  image?: StorefrontAPI.Maybe<
                                    Pick<
                                      StorefrontAPI.Image,
                                      'url' | 'altText' | 'width' | 'height'
                                    >
                                  >;
                                }
                              >;
                            }
                          >;
                        })
                    >;
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                          fields: Array<
                            Pick<
                              StorefrontAPI.MetaobjectField,
                              'key' | 'value'
                            > & {
                              reference?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.MediaImage, 'id'> & {
                                  image?: StorefrontAPI.Maybe<
                                    Pick<
                                      StorefrontAPI.Image,
                                      'url' | 'altText' | 'width' | 'height'
                                    >
                                  >;
                                }
                              >;
                            }
                          >;
                        }
                      >;
                    }>;
                  }
                >;
              }
            >;
          }>;
        }
      >;
    }
  >;
  homeLiving?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
      fields: Array<
        Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
          reference?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metaobject, 'id'> & {
              fields: Array<
                Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
              >;
            }
          >;
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
                fields: Array<
                  Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                    reference?: StorefrontAPI.Maybe<
                      | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                          image?: StorefrontAPI.Maybe<
                            Pick<
                              StorefrontAPI.Image,
                              'url' | 'altText' | 'width' | 'height'
                            >
                          >;
                        })
                      | (Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                          fields: Array<
                            Pick<
                              StorefrontAPI.MetaobjectField,
                              'key' | 'value'
                            > & {
                              reference?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.MediaImage, 'id'> & {
                                  image?: StorefrontAPI.Maybe<
                                    Pick<
                                      StorefrontAPI.Image,
                                      'url' | 'altText' | 'width' | 'height'
                                    >
                                  >;
                                }
                              >;
                            }
                          >;
                        })
                    >;
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                          fields: Array<
                            Pick<
                              StorefrontAPI.MetaobjectField,
                              'key' | 'value'
                            > & {
                              reference?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.MediaImage, 'id'> & {
                                  image?: StorefrontAPI.Maybe<
                                    Pick<
                                      StorefrontAPI.Image,
                                      'url' | 'altText' | 'width' | 'height'
                                    >
                                  >;
                                }
                              >;
                            }
                          >;
                        }
                      >;
                    }>;
                  }
                >;
              }
            >;
          }>;
        }
      >;
    }
  >;
  babyShop?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
      fields: Array<
        Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
          reference?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metaobject, 'id'> & {
              fields: Array<
                Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
              >;
            }
          >;
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
                fields: Array<
                  Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                    reference?: StorefrontAPI.Maybe<
                      | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                          image?: StorefrontAPI.Maybe<
                            Pick<
                              StorefrontAPI.Image,
                              'url' | 'altText' | 'width' | 'height'
                            >
                          >;
                        })
                      | (Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                          fields: Array<
                            Pick<
                              StorefrontAPI.MetaobjectField,
                              'key' | 'value'
                            > & {
                              reference?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.MediaImage, 'id'> & {
                                  image?: StorefrontAPI.Maybe<
                                    Pick<
                                      StorefrontAPI.Image,
                                      'url' | 'altText' | 'width' | 'height'
                                    >
                                  >;
                                }
                              >;
                            }
                          >;
                        })
                    >;
                    references?: StorefrontAPI.Maybe<{
                      nodes: Array<
                        Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                          fields: Array<
                            Pick<
                              StorefrontAPI.MetaobjectField,
                              'key' | 'value'
                            > & {
                              reference?: StorefrontAPI.Maybe<
                                Pick<StorefrontAPI.MediaImage, 'id'> & {
                                  image?: StorefrontAPI.Maybe<
                                    Pick<
                                      StorefrontAPI.Image,
                                      'url' | 'altText' | 'width' | 'height'
                                    >
                                  >;
                                }
                              >;
                            }
                          >;
                        }
                      >;
                    }>;
                  }
                >;
              }
            >;
          }>;
        }
      >;
    }
  >;
};

export type MoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'currencyCode' | 'amount'
>;

export type CartLineFragment = Pick<
  StorefrontAPI.CartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
  parentRelationship?: StorefrontAPI.Maybe<{
    parent: Pick<StorefrontAPI.CartLine, 'id'>;
  }>;
};

export type CartLineComponentFragment = Pick<
  StorefrontAPI.ComponentizableCartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
  lineComponents: Array<
    Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
      attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
      cost: {
        totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
        amountPerQuantity: Pick<
          StorefrontAPI.MoneyV2,
          'currencyCode' | 'amount'
        >;
        compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
        >;
      };
      merchandise: Pick<
        StorefrontAPI.ProductVariant,
        'id' | 'availableForSale' | 'requiresShipping' | 'title'
      > & {
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        product: Pick<
          StorefrontAPI.Product,
          'handle' | 'title' | 'id' | 'vendor'
        >;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
      };
      parentRelationship?: StorefrontAPI.Maybe<{
        parent: Pick<StorefrontAPI.CartLine, 'id'>;
      }>;
    }
  >;
};

export type CartApiQueryFragment = Pick<
  StorefrontAPI.Cart,
  'updatedAt' | 'id' | 'checkoutUrl' | 'totalQuantity' | 'note'
> & {
  appliedGiftCards: Array<
    Pick<StorefrontAPI.AppliedGiftCard, 'id' | 'lastCharacters'> & {
      amountUsed: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    }
  >;
  buyerIdentity: Pick<
    StorefrontAPI.CartBuyerIdentity,
    'countryCode' | 'email' | 'phone'
  > & {
    customer?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Customer,
        'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
      >
    >;
  };
  lines: {
    nodes: Array<
      | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
          parentRelationship?: StorefrontAPI.Maybe<{
            parent: Pick<StorefrontAPI.CartLine, 'id'>;
          }>;
        })
      | (Pick<StorefrontAPI.ComponentizableCartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
          lineComponents: Array<
            Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
              attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
              cost: {
                totalAmount: Pick<
                  StorefrontAPI.MoneyV2,
                  'currencyCode' | 'amount'
                >;
                amountPerQuantity: Pick<
                  StorefrontAPI.MoneyV2,
                  'currencyCode' | 'amount'
                >;
                compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                >;
              };
              merchandise: Pick<
                StorefrontAPI.ProductVariant,
                'id' | 'availableForSale' | 'requiresShipping' | 'title'
              > & {
                compareAtPrice?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                >;
                price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
                product: Pick<
                  StorefrontAPI.Product,
                  'handle' | 'title' | 'id' | 'vendor'
                >;
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
              };
              parentRelationship?: StorefrontAPI.Maybe<{
                parent: Pick<StorefrontAPI.CartLine, 'id'>;
              }>;
            }
          >;
        })
    >;
  };
  cost: {
    subtotalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalDutyAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    totalTaxAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  discountCodes: Array<
    Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
  >;
};

export type MenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type GrandchildMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ChildMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    >
  >;
};

export type ParentMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  resource?: StorefrontAPI.Maybe<{
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
    >;
    products: {
      nodes: Array<{
        featuredImage?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
      }>;
    };
  }>;
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        >
      >;
    }
  >;
};

export type MenuFragment = Pick<StorefrontAPI.Menu, 'id'> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      resource?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        products: {
          nodes: Array<{
            featuredImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          }>;
        };
      }>;
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
};

export type ShopFragment = Pick<
  StorefrontAPI.Shop,
  'id' | 'name' | 'description'
> & {
  primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
  brand?: StorefrontAPI.Maybe<{
    logo?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
    }>;
  }>;
};

export type AnnouncementBarMetaobjectFragment = Pick<
  StorefrontAPI.Metaobject,
  'id' | 'handle' | 'type'
> & {
  fields: Array<
    Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
      reference?: StorefrontAPI.Maybe<
        | Pick<StorefrontAPI.Collection, 'id' | 'handle' | 'title'>
        | (Pick<StorefrontAPI.MediaImage, 'id'> & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          })
        | Pick<StorefrontAPI.Page, 'id' | 'handle' | 'title'>
        | Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'>
      >;
    }
  >;
};

export type HeaderQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  headerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HeaderQuery = {
  shop: Pick<StorefrontAPI.Shop, 'id' | 'name' | 'description'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    brand?: StorefrontAPI.Maybe<{
      logo?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      }>;
    }>;
  };
  menu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          resource?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
            products: {
              nodes: Array<{
                featuredImage?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              }>;
            };
          }>;
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            > & {
              items: Array<
                Pick<
                  StorefrontAPI.MenuItem,
                  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
                >
              >;
            }
          >;
        }
      >;
    }
  >;
  topBar?: StorefrontAPI.Maybe<{
    fields: Array<
      Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
        references?: StorefrontAPI.Maybe<{
          nodes: Array<{
            fields: Array<
              Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
                reference?: StorefrontAPI.Maybe<{
                  image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
                }>;
              }
            >;
          }>;
        }>;
      }
    >;
  }>;
  announcementBarMetaobject?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
      fields: Array<
        Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
          reference?: StorefrontAPI.Maybe<
            | Pick<StorefrontAPI.Collection, 'id' | 'handle' | 'title'>
            | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                image?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url' | 'altText'>
                >;
              })
            | Pick<StorefrontAPI.Page, 'id' | 'handle' | 'title'>
            | Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'>
          >;
        }
      >;
    }
  >;
  announcementBarMetaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle' | 'type'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
            reference?: StorefrontAPI.Maybe<
              | Pick<StorefrontAPI.Collection, 'id' | 'handle' | 'title'>
              | (Pick<StorefrontAPI.MediaImage, 'id'> & {
                  image?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.Image, 'url' | 'altText'>
                  >;
                })
              | Pick<StorefrontAPI.Page, 'id' | 'handle' | 'title'>
              | Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'>
            >;
          }
        >;
      }
    >;
  };
};

export type FooterMenuFragment = Pick<StorefrontAPI.Menu, 'id' | 'title'> & {
  items: Array<Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'url'>>;
};

export type FooterQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type FooterQuery = {
  women?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id' | 'title'> & {
      items: Array<Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'url'>>;
    }
  >;
  men?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id' | 'title'> & {
      items: Array<Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'url'>>;
    }
  >;
  kids?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id' | 'title'> & {
      items: Array<Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'url'>>;
    }
  >;
  beauty?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id' | 'title'> & {
      items: Array<Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'url'>>;
    }
  >;
  footwear?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id' | 'title'> & {
      items: Array<Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'url'>>;
    }
  >;
  bags?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id' | 'title'> & {
      items: Array<Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'url'>>;
    }
  >;
  homeLiving?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id' | 'title'> & {
      items: Array<Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'url'>>;
    }
  >;
  babyshop?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id' | 'title'> & {
      items: Array<Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'url'>>;
    }
  >;
  more?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id' | 'title'> & {
      items: Array<Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'url'>>;
    }
  >;
  help?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id' | 'title'> & {
      items: Array<Pick<StorefrontAPI.MenuItem, 'id' | 'title' | 'url'>>;
    }
  >;
  footerMain?: StorefrontAPI.Maybe<{
    contacts?: StorefrontAPI.Maybe<{
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
            name?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MetaobjectField, 'value'>
            >;
            contact?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MetaobjectField, 'value'>
            >;
            sortOrder?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MetaobjectField, 'value'>
            >;
          }
        >;
      }>;
    }>;
    copyright?: StorefrontAPI.Maybe<{
      reference?: StorefrontAPI.Maybe<{
        text?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        logo?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          }>;
        }>;
        links?: StorefrontAPI.Maybe<{
          references?: StorefrontAPI.Maybe<{
            nodes: Array<
              Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
                text?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MetaobjectField, 'value'>
                >;
                sortOrder?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MetaobjectField, 'value'>
                >;
              }
            >;
          }>;
        }>;
      }>;
    }>;
  }>;
  headerLogo: {
    nodes: Array<{
      logo?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<{
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }>;
      }>;
    }>;
  };
  shop: Pick<StorefrontAPI.Shop, 'name'> & {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'handle' | 'title'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'handle' | 'title'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'handle' | 'title'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'handle' | 'title'>
    >;
  };
};

export type HomeSectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomeSectionsQuery = {
  sections: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id' | 'handle'> & {
        heading?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            title?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MetaobjectField, 'value'>
            >;
          }>;
        }>;
        order?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        hidden?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        mobileBanner?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metaobject, 'id'>>;
        }>;
        data?: StorefrontAPI.Maybe<{
          references?: StorefrontAPI.Maybe<{
            nodes: Array<Pick<StorefrontAPI.Metaobject, 'id' | 'type'>>;
          }>;
        }>;
      }
    >;
  };
};

export type HomeImageFragment = {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
  >;
};

export type HomeLeafFragment = Pick<
  StorefrontAPI.Metaobject,
  'id' | 'type' | 'handle'
> & {
  fields: Array<
    Pick<StorefrontAPI.MetaobjectField, 'key' | 'type' | 'value'> & {
      reference?: StorefrontAPI.Maybe<
        | {
            __typename:
              | 'Article'
              | 'GenericFile'
              | 'Metaobject'
              | 'Model3d'
              | 'Page'
              | 'Product'
              | 'ProductVariant'
              | 'Video';
          }
        | ({__typename: 'Collection'} & Pick<
            StorefrontAPI.Collection,
            'handle'
          >)
        | ({__typename: 'MediaImage'} & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          })
      >;
    }
  >;
};

export type HomeNodesQueryVariables = StorefrontAPI.Exact<{
  ids:
    | Array<StorefrontAPI.Scalars['ID']['input']>
    | StorefrontAPI.Scalars['ID']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomeNodesQuery = {
  nodes: Array<
    StorefrontAPI.Maybe<
      | {
          __typename:
            | 'AppliedGiftCard'
            | 'Article'
            | 'Blog'
            | 'Cart'
            | 'CartLine'
            | 'Collection'
            | 'Comment'
            | 'Company'
            | 'CompanyContact'
            | 'CompanyLocation'
            | 'ComponentizableCartLine'
            | 'ExternalVideo'
            | 'GenericFile'
            | 'Location'
            | 'MailingAddress'
            | 'Market'
            | 'MediaImage'
            | 'MediaPresentation'
            | 'Menu'
            | 'MenuItem';
        }
      | {
          __typename:
            | 'Metafield'
            | 'Model3d'
            | 'Order'
            | 'Page'
            | 'Product'
            | 'ProductOption'
            | 'ProductOptionValue'
            | 'ProductVariant'
            | 'Shop'
            | 'ShopPayInstallmentsFinancingPlan'
            | 'ShopPayInstallmentsFinancingPlanTerm'
            | 'ShopPayInstallmentsProductVariantPricing'
            | 'ShopPolicy'
            | 'TaxonomyCategory'
            | 'UrlRedirect'
            | 'Video';
        }
      | ({__typename: 'Metaobject'} & Pick<
          StorefrontAPI.Metaobject,
          'id' | 'type' | 'handle'
        > & {
            fields: Array<
              Pick<StorefrontAPI.MetaobjectField, 'key' | 'type' | 'value'> & {
                reference?: StorefrontAPI.Maybe<
                  | {
                      __typename:
                        | 'Article'
                        | 'GenericFile'
                        | 'Model3d'
                        | 'Page'
                        | 'Product'
                        | 'ProductVariant'
                        | 'Video';
                    }
                  | ({__typename: 'Collection'} & Pick<
                      StorefrontAPI.Collection,
                      'handle'
                    >)
                  | ({__typename: 'MediaImage'} & {
                      image?: StorefrontAPI.Maybe<
                        Pick<
                          StorefrontAPI.Image,
                          'url' | 'altText' | 'width' | 'height'
                        >
                      >;
                    })
                  | ({__typename: 'Metaobject'} & Pick<
                      StorefrontAPI.Metaobject,
                      'id' | 'type' | 'handle'
                    > & {
                        fields: Array<
                          Pick<
                            StorefrontAPI.MetaobjectField,
                            'key' | 'type' | 'value'
                          > & {
                            reference?: StorefrontAPI.Maybe<
                              | {
                                  __typename:
                                    | 'Article'
                                    | 'GenericFile'
                                    | 'Metaobject'
                                    | 'Model3d'
                                    | 'Page'
                                    | 'Product'
                                    | 'ProductVariant'
                                    | 'Video';
                                }
                              | ({__typename: 'Collection'} & Pick<
                                  StorefrontAPI.Collection,
                                  'handle'
                                >)
                              | ({__typename: 'MediaImage'} & {
                                  image?: StorefrontAPI.Maybe<
                                    Pick<
                                      StorefrontAPI.Image,
                                      'url' | 'altText' | 'width' | 'height'
                                    >
                                  >;
                                })
                            >;
                          }
                        >;
                      })
                >;
                references?: StorefrontAPI.Maybe<{
                  nodes: Array<
                    | {
                        __typename:
                          | 'Article'
                          | 'Collection'
                          | 'GenericFile'
                          | 'MediaImage'
                          | 'Model3d'
                          | 'Page'
                          | 'Product'
                          | 'ProductVariant'
                          | 'Video';
                      }
                    | ({__typename: 'Metaobject'} & Pick<
                        StorefrontAPI.Metaobject,
                        'id' | 'type' | 'handle'
                      > & {
                          fields: Array<
                            Pick<
                              StorefrontAPI.MetaobjectField,
                              'key' | 'type' | 'value'
                            > & {
                              reference?: StorefrontAPI.Maybe<
                                | {
                                    __typename:
                                      | 'Article'
                                      | 'GenericFile'
                                      | 'Metaobject'
                                      | 'Model3d'
                                      | 'Page'
                                      | 'Product'
                                      | 'ProductVariant'
                                      | 'Video';
                                  }
                                | ({__typename: 'Collection'} & Pick<
                                    StorefrontAPI.Collection,
                                    'handle'
                                  >)
                                | ({__typename: 'MediaImage'} & {
                                    image?: StorefrontAPI.Maybe<
                                      Pick<
                                        StorefrontAPI.Image,
                                        'url' | 'altText' | 'width' | 'height'
                                      >
                                    >;
                                  })
                              >;
                            }
                          >;
                        })
                  >;
                }>;
              }
            >;
          })
    >
  >;
};

export type ProductCardFragment = Pick<
  StorefrontAPI.Product,
  | 'id'
  | 'handle'
  | 'title'
  | 'vendor'
  | 'publishedAt'
  | 'availableForSale'
  | 'tags'
> & {
  images: {
    nodes: Array<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
  };
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  compareAtPriceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  rating?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  ratingCount?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
};

export type MainHeaderMetaobjectQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type MainHeaderMetaobjectQuery = {
  metaobject?: StorefrontAPI.Maybe<{
    fields: Array<
      Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
        reference?: StorefrontAPI.Maybe<
          | {image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>}
          | {
              fields: Array<
                Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'>
              >;
            }
        >;
      }
    >;
  }>;
};

export type ArticleQueryVariables = StorefrontAPI.Exact<{
  articleHandle: StorefrontAPI.Scalars['String']['input'];
  blogHandle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ArticleQuery = {
  blog?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Blog, 'handle'> & {
      articleByHandle?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.Article,
          'handle' | 'title' | 'contentHtml' | 'publishedAt'
        > & {
          author?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ArticleAuthor, 'name'>
          >;
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'altText' | 'url' | 'width' | 'height'
            >
          >;
          seo?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Seo, 'description' | 'title'>
          >;
        }
      >;
    }
  >;
};

export type BlogQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  blogHandle: StorefrontAPI.Scalars['String']['input'];
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type BlogQuery = {
  blog?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Blog, 'title' | 'handle'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'title' | 'description'>
      >;
      articles: {
        nodes: Array<
          Pick<
            StorefrontAPI.Article,
            'contentHtml' | 'handle' | 'id' | 'publishedAt' | 'title'
          > & {
            author?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ArticleAuthor, 'name'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'altText' | 'url' | 'width' | 'height'
              >
            >;
            blog: Pick<StorefrontAPI.Blog, 'handle'>;
          }
        >;
        pageInfo: Pick<
          StorefrontAPI.PageInfo,
          'hasPreviousPage' | 'hasNextPage' | 'endCursor' | 'startCursor'
        >;
      };
    }
  >;
};

export type ArticleItemFragment = Pick<
  StorefrontAPI.Article,
  'contentHtml' | 'handle' | 'id' | 'publishedAt' | 'title'
> & {
  author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'altText' | 'url' | 'width' | 'height'>
  >;
  blog: Pick<StorefrontAPI.Blog, 'handle'>;
};

export type BlogsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type BlogsQuery = {
  blogs: {
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
    >;
    nodes: Array<
      Pick<StorefrontAPI.Blog, 'title' | 'handle'> & {
        seo?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Seo, 'title' | 'description'>
        >;
      }
    >;
  };
};

export type EmptyCollectionFallbackQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type EmptyCollectionFallbackQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'handle'
        | 'title'
        | 'vendor'
        | 'publishedAt'
        | 'availableForSale'
        | 'tags'
      > & {
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        rating?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        ratingCount?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
      }
    >;
  };
};

export type CollectionPlpQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  filters?: StorefrontAPI.InputMaybe<
    Array<StorefrontAPI.ProductFilter> | StorefrontAPI.ProductFilter
  >;
  sortKey?: StorefrontAPI.InputMaybe<StorefrontAPI.ProductCollectionSortKeys>;
  reverse?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Boolean']['input']>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CollectionPlpQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description' | 'descriptionHtml'
    > & {
      seo: Pick<StorefrontAPI.Seo, 'title' | 'description'>;
      faq?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      products: {
        filters: Array<
          Pick<StorefrontAPI.Filter, 'id' | 'label' | 'type'> & {
            values: Array<
              Pick<
                StorefrontAPI.FilterValue,
                'id' | 'label' | 'count' | 'input'
              >
            >;
          }
        >;
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            | 'id'
            | 'handle'
            | 'title'
            | 'vendor'
            | 'publishedAt'
            | 'availableForSale'
            | 'tags'
          > & {
            images: {
              nodes: Array<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
            };
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            compareAtPriceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            rating?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            ratingCount?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
          }
        >;
        pageInfo: Pick<
          StorefrontAPI.PageInfo,
          'hasPreviousPage' | 'hasNextPage' | 'startCursor' | 'endCursor'
        >;
      };
    }
  >;
};

export type PopularSearchesQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type PopularSearchesQuery = {
  menu?: StorefrontAPI.Maybe<{
    items: Array<Pick<StorefrontAPI.MenuItem, 'title' | 'url'>>;
  }>;
};

export type CollectionFragment = Pick<
  StorefrontAPI.Collection,
  'id' | 'title' | 'handle'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
};

export type StoreCollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type StoreCollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type CatalogQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type CatalogQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'handle'
        | 'title'
        | 'vendor'
        | 'publishedAt'
        | 'availableForSale'
        | 'tags'
      > & {
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        rating?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        ratingCount?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasPreviousPage' | 'hasNextPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type NewsletterSubscribeMutationVariables = StorefrontAPI.Exact<{
  input: StorefrontAPI.CustomerCreateInput;
}>;

export type NewsletterSubscribeMutation = {
  customerCreate?: StorefrontAPI.Maybe<{
    customer?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Customer, 'id'>>;
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'message'>
    >;
  }>;
};

export type PageQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type PageQuery = {
  page?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Page, 'handle' | 'id' | 'title' | 'body'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'description' | 'title'>
      >;
    }
  >;
};

export type ContactPageQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ContactPageQuery = {
  page?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Page, 'body'>>;
  footer?: StorefrontAPI.Maybe<{
    contacts?: StorefrontAPI.Maybe<{
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<StorefrontAPI.Metaobject, 'id'> & {
            name?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MetaobjectField, 'value'>
            >;
            contact?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MetaobjectField, 'value'>
            >;
            sortOrder?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MetaobjectField, 'value'>
            >;
          }
        >;
      }>;
    }>;
  }>;
};

export type PolicyFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'body' | 'handle' | 'id' | 'title' | 'url'
>;

export type PolicyQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  privacyPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  refundPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  shippingPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  termsOfService: StorefrontAPI.Scalars['Boolean']['input'];
}>;

export type PolicyQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
  };
};

export type PolicyItemFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'id' | 'title' | 'handle'
>;

export type PoliciesQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type PoliciesQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    subscriptionPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicyWithDefault, 'id' | 'title' | 'handle'>
    >;
  };
};

export type ProductVariantFragment = Pick<
  StorefrontAPI.ProductVariant,
  'availableForSale' | 'id' | 'sku' | 'title'
> & {
  compareAtPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  image?: StorefrontAPI.Maybe<
    {__typename: 'Image'} & Pick<
      StorefrontAPI.Image,
      'id' | 'url' | 'altText' | 'width' | 'height'
    >
  >;
  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
  selectedOptions: Array<Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>>;
  unitPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
};

export type ProductFragment = Pick<
  StorefrontAPI.Product,
  | 'id'
  | 'title'
  | 'vendor'
  | 'handle'
  | 'descriptionHtml'
  | 'description'
  | 'encodedVariantExistence'
  | 'encodedVariantAvailability'
> & {
  images: {
    nodes: Array<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
  };
  collections: {
    nodes: Array<Pick<StorefrontAPI.Collection, 'handle' | 'title'>>;
  };
  options: Array<
    Pick<StorefrontAPI.ProductOption, 'name'> & {
      optionValues: Array<
        Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
          firstSelectableVariant?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.ProductVariant,
              'availableForSale' | 'id' | 'sku' | 'title'
            > & {
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              image?: StorefrontAPI.Maybe<
                {__typename: 'Image'} & Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              unitPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            }
          >;
          swatch?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
              image?: StorefrontAPI.Maybe<{
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              }>;
            }
          >;
        }
      >;
    }
  >;
  selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.ProductVariant,
      'availableForSale' | 'id' | 'sku' | 'title'
    > & {
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      image?: StorefrontAPI.Maybe<
        {__typename: 'Image'} & Pick<
          StorefrontAPI.Image,
          'id' | 'url' | 'altText' | 'width' | 'height'
        >
      >;
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
      unitPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
    }
  >;
  adjacentVariants: Array<
    Pick<
      StorefrontAPI.ProductVariant,
      'availableForSale' | 'id' | 'sku' | 'title'
    > & {
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      image?: StorefrontAPI.Maybe<
        {__typename: 'Image'} & Pick<
          StorefrontAPI.Image,
          'id' | 'url' | 'altText' | 'width' | 'height'
        >
      >;
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
      unitPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
    }
  >;
  specs: Array<
    StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'key' | 'value'>>
  >;
  sizeChart?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<
      | {
          __typename:
            | 'Article'
            | 'Collection'
            | 'GenericFile'
            | 'Metaobject'
            | 'Model3d'
            | 'Page'
            | 'Product'
            | 'ProductVariant'
            | 'Video';
        }
      | ({__typename: 'MediaImage'} & {
          image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
        })
    >;
  }>;
  rating?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  ratingCount?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
};

export type ProductQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  selectedOptions:
    | Array<StorefrontAPI.SelectedOptionInput>
    | StorefrontAPI.SelectedOptionInput;
  specs:
    | Array<StorefrontAPI.HasMetafieldsIdentifier>
    | StorefrontAPI.HasMetafieldsIdentifier;
}>;

export type ProductQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      | 'id'
      | 'title'
      | 'vendor'
      | 'handle'
      | 'descriptionHtml'
      | 'description'
      | 'encodedVariantExistence'
      | 'encodedVariantAvailability'
    > & {
      images: {
        nodes: Array<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      };
      collections: {
        nodes: Array<Pick<StorefrontAPI.Collection, 'handle' | 'title'>>;
      };
      options: Array<
        Pick<StorefrontAPI.ProductOption, 'name'> & {
          optionValues: Array<
            Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
              firstSelectableVariant?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.ProductVariant,
                  'availableForSale' | 'id' | 'sku' | 'title'
                > & {
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                  image?: StorefrontAPI.Maybe<
                    {__typename: 'Image'} & Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  unitPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                }
              >;
              swatch?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                  image?: StorefrontAPI.Maybe<{
                    previewImage?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Image, 'url'>
                    >;
                  }>;
                }
              >;
            }
          >;
        }
      >;
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.ProductVariant,
          'availableForSale' | 'id' | 'sku' | 'title'
        > & {
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          image?: StorefrontAPI.Maybe<
            {__typename: 'Image'} & Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }
      >;
      adjacentVariants: Array<
        Pick<
          StorefrontAPI.ProductVariant,
          'availableForSale' | 'id' | 'sku' | 'title'
        > & {
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          image?: StorefrontAPI.Maybe<
            {__typename: 'Image'} & Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }
      >;
      specs: Array<
        StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'key' | 'value'>>
      >;
      sizeChart?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | {
              __typename:
                | 'Article'
                | 'Collection'
                | 'GenericFile'
                | 'Metaobject'
                | 'Model3d'
                | 'Page'
                | 'Product'
                | 'ProductVariant'
                | 'Video';
            }
          | ({__typename: 'MediaImage'} & {
              image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
            })
        >;
      }>;
      rating?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      ratingCount?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
    }
  >;
};

export type ProductRecommendationsQueryVariables = StorefrontAPI.Exact<{
  productId: StorefrontAPI.Scalars['ID']['input'];
  intent?: StorefrontAPI.InputMaybe<StorefrontAPI.ProductRecommendationIntent>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ProductRecommendationsQuery = {
  productRecommendations?: StorefrontAPI.Maybe<
    Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'handle'
        | 'title'
        | 'vendor'
        | 'publishedAt'
        | 'availableForSale'
        | 'tags'
      > & {
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        rating?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        ratingCount?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
      }
    >
  >;
};

export type ProductStockQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ProductStockQuery = {
  product?: StorefrontAPI.Maybe<{
    variants: {
      nodes: Array<
        Pick<StorefrontAPI.ProductVariant, 'id' | 'quantityAvailable'>
      >;
    };
  }>;
};

export type SearchProductsQueryVariables = StorefrontAPI.Exact<{
  term: StorefrontAPI.Scalars['String']['input'];
  filters?: StorefrontAPI.InputMaybe<
    Array<StorefrontAPI.ProductFilter> | StorefrontAPI.ProductFilter
  >;
  sortKey?: StorefrontAPI.InputMaybe<StorefrontAPI.SearchSortKeys>;
  reverse?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Boolean']['input']>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SearchProductsQuery = {
  products: Pick<StorefrontAPI.SearchResultItemConnection, 'totalCount'> & {
    productFilters: Array<
      Pick<StorefrontAPI.Filter, 'id' | 'label' | 'type'> & {
        values: Array<
          Pick<StorefrontAPI.FilterValue, 'id' | 'label' | 'count' | 'input'>
        >;
      }
    >;
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'handle'
        | 'title'
        | 'vendor'
        | 'publishedAt'
        | 'availableForSale'
        | 'tags'
      > & {
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        rating?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        ratingCount?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'value'>
        >;
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasPreviousPage' | 'hasNextPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type PredictiveArticleFragment = {__typename: 'Article'} & Pick<
  StorefrontAPI.Article,
  'id' | 'title' | 'handle' | 'trackingParameters'
> & {
    blog: Pick<StorefrontAPI.Blog, 'handle'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
    >;
  };

export type PredictiveCollectionFragment = {__typename: 'Collection'} & Pick<
  StorefrontAPI.Collection,
  'id' | 'title' | 'handle' | 'trackingParameters'
> & {
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
    >;
  };

export type PredictivePageFragment = {__typename: 'Page'} & Pick<
  StorefrontAPI.Page,
  'id' | 'title' | 'handle' | 'trackingParameters'
>;

export type PredictiveProductFragment = {__typename: 'Product'} & Pick<
  StorefrontAPI.Product,
  'id' | 'title' | 'handle' | 'trackingParameters'
> & {
    selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ProductVariant, 'id'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      }
    >;
  };

export type PredictiveQueryFragment = {
  __typename: 'SearchQuerySuggestion';
} & Pick<
  StorefrontAPI.SearchQuerySuggestion,
  'text' | 'styledText' | 'trackingParameters'
>;

export type PredictiveSearchQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  limit: StorefrontAPI.Scalars['Int']['input'];
  limitScope: StorefrontAPI.PredictiveSearchLimitScope;
  term: StorefrontAPI.Scalars['String']['input'];
  types?: StorefrontAPI.InputMaybe<
    | Array<StorefrontAPI.PredictiveSearchType>
    | StorefrontAPI.PredictiveSearchType
  >;
}>;

export type PredictiveSearchQuery = {
  predictiveSearch?: StorefrontAPI.Maybe<{
    articles: Array<
      {__typename: 'Article'} & Pick<
        StorefrontAPI.Article,
        'id' | 'title' | 'handle' | 'trackingParameters'
      > & {
          blog: Pick<StorefrontAPI.Blog, 'handle'>;
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
    >;
    collections: Array<
      {__typename: 'Collection'} & Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'trackingParameters'
      > & {
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
    >;
    pages: Array<
      {__typename: 'Page'} & Pick<
        StorefrontAPI.Page,
        'id' | 'title' | 'handle' | 'trackingParameters'
      >
    >;
    products: Array<
      {__typename: 'Product'} & Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'trackingParameters'
      > & {
          selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductVariant, 'id'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            }
          >;
        }
    >;
    queries: Array<
      {__typename: 'SearchQuerySuggestion'} & Pick<
        StorefrontAPI.SearchQuerySuggestion,
        'text' | 'styledText' | 'trackingParameters'
      >
    >;
  }>;
};

interface GeneratedQueryTypes {
  '#graphql\n  #graphql\n  fragment BabyShopMediaImage on MediaImage {\n    id\n    image {\n      url\n      altText\n      width\n      height\n    }\n  }\n\n  fragment BabyShopCardItem on Metaobject {\n    id\n    handle\n    fields {\n      key\n      value\n      reference {\n        ...BabyShopMediaImage\n      }\n    }\n  }\n\n  fragment BabyShopBannerItem on Metaobject {\n    id\n    handle\n    fields {\n      key\n      value\n      reference {\n        ...BabyShopMediaImage\n      }\n    }\n  }\n\n  fragment BabyShopDataNode on Metaobject {\n    id\n    handle\n    fields {\n      key\n      value\n      reference {\n        ...BabyShopBannerItem\n        ...BabyShopMediaImage\n      }\n      references(first: 20) {\n        nodes {\n          ... on Metaobject {\n            ...BabyShopCardItem\n          }\n        }\n      }\n    }\n  }\n\n  fragment BabyShopMetaobject on Metaobject {\n    id\n    handle\n    fields {\n      key\n      value\n      reference {\n        ... on Metaobject {\n          id\n          fields {\n            key\n            value\n          }\n        }\n      }\n      references(first: 2) {\n        nodes {\n          ... on Metaobject {\n            ...BabyShopDataNode\n          }\n        }\n      }\n    }\n  }\n\n  query HomePageBabyShop($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    babyShopMetaobject: metaobject(handle: {handle: "babyshop", type: "home_page"}) {\n      ...BabyShopMetaobject\n    }\n    babyShopDataMetaobjects: metaobjects(type: "babyshop_data", first: 1) {\n      nodes {\n        ...BabyShopDataNode\n      }\n    }\n  }\n': {
    return: HomePageBabyShopQuery;
    variables: HomePageBabyShopQueryVariables;
  };
  '#graphql\n  #graphql\n  fragment ShowcaseMediaImage on MediaImage {\n    id\n    image {\n      url\n      altText\n      width\n      height\n    }\n  }\n\n  fragment ShowcaseBannerItem on Metaobject {\n    id\n    handle\n    fields {\n      key\n      value\n      reference {\n        ...ShowcaseMediaImage\n      }\n    }\n  }\n\n  fragment ShowcaseCardItem on Metaobject {\n    id\n    handle\n    fields {\n      key\n      value\n      reference {\n        ...ShowcaseMediaImage\n      }\n    }\n  }\n\n  fragment ShowcaseDataNode on Metaobject {\n    id\n    handle\n    type\n    fields {\n      key\n      value\n      reference {\n        ...ShowcaseBannerItem\n        ...ShowcaseMediaImage\n      }\n      references(first: 12) {\n        nodes {\n          ... on Metaobject {\n            ...ShowcaseCardItem\n          }\n        }\n      }\n    }\n  }\n\n  fragment ShowcaseSectionMetaobject on Metaobject {\n    id\n    handle\n    type\n    fields {\n      key\n      value\n      reference {\n        ... on Metaobject {\n          id\n          fields {\n            key\n            value\n          }\n        }\n      }\n      references(first: 10) {\n        nodes {\n          ... on Metaobject {\n            ...ShowcaseDataNode\n          }\n        }\n      }\n    }\n  }\n\n  query HomePageSections($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    homePageSections: metaobjects(type: "home_page", first: 20) {\n      nodes {\n        ...ShowcaseSectionMetaobject\n      }\n    }\n  }\n': {
    return: HomePageSectionsQuery;
    variables: HomePageSectionsQueryVariables;
  };
  '#graphql\n  #graphql\n  fragment ShowcaseMediaImage on MediaImage {\n    id\n    image {\n      url\n      altText\n      width\n      height\n    }\n  }\n\n  fragment ShowcaseBannerItem on Metaobject {\n    id\n    handle\n    fields {\n      key\n      value\n      reference {\n        ...ShowcaseMediaImage\n      }\n    }\n  }\n\n  fragment ShowcaseCardItem on Metaobject {\n    id\n    handle\n    fields {\n      key\n      value\n      reference {\n        ...ShowcaseMediaImage\n      }\n    }\n  }\n\n  fragment ShowcaseDataNode on Metaobject {\n    id\n    handle\n    type\n    fields {\n      key\n      value\n      reference {\n        ...ShowcaseBannerItem\n        ...ShowcaseMediaImage\n      }\n      references(first: 12) {\n        nodes {\n          ... on Metaobject {\n            ...ShowcaseCardItem\n          }\n        }\n      }\n    }\n  }\n\n  fragment ShowcaseSectionMetaobject on Metaobject {\n    id\n    handle\n    type\n    fields {\n      key\n      value\n      reference {\n        ... on Metaobject {\n          id\n          fields {\n            key\n            value\n          }\n        }\n      }\n      references(first: 10) {\n        nodes {\n          ... on Metaobject {\n            ...ShowcaseDataNode\n          }\n        }\n      }\n    }\n  }\n\n  query HomePageShowcaseSections($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    bestsellers: metaobject(handle: {handle: "bestseller", type: "home_page"}) {\n      ...ShowcaseSectionMetaobject\n    }\n    topBrands: metaobject(handle: {handle: "top-brands-on-lifestyle-collections", type: "home_page"}) {\n      ...ShowcaseSectionMetaobject\n    }\n    festiveEdit: metaobject(handle: {handle: "festive-edit", type: "home_page"}) {\n      ...ShowcaseSectionMetaobject\n    }\n    homeLiving: metaobject(handle: {handle: "all-new-home-living-store", type: "home_page"}) {\n      ...ShowcaseSectionMetaobject\n    }\n    babyShop: metaobject(handle: {handle: "babyshop", type: "home_page"}) {\n      ...ShowcaseSectionMetaobject\n    }\n  }\n': {
    return: HomePageShowcaseSectionsQuery;
    variables: HomePageShowcaseSectionsQueryVariables;
  };
  '#graphql\n  fragment Shop on Shop {\n    id\n    name\n    description\n    primaryDomain {\n      url\n    }\n    brand {\n      logo {\n        image {\n          url\n        }\n      }\n    }\n  }\n  fragment AnnouncementBarMetaobject on Metaobject {\n    id\n    handle\n    type\n    fields {\n      key\n      value\n      reference {\n        ... on MediaImage {\n          id\n          image {\n            url\n            altText\n          }\n        }\n        ... on Collection {\n          id\n          handle\n          title\n        }\n        ... on Product {\n          id\n          handle\n          title\n        }\n        ... on Page {\n          id\n          handle\n          title\n        }\n      }\n    }\n  }\n  query Header(\n    $country: CountryCode\n    $headerMenuHandle: String!\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    shop {\n      ...Shop\n    }\n    menu(handle: $headerMenuHandle) {\n      ...Menu\n    }\n    topBar: metaobject(handle: {type: "top_bar_link_main", handle: "top-bar-link-main"}) {\n      fields {\n        key\n        value\n        references(first: 10) {\n          nodes {\n            ... on Metaobject {\n              fields {\n                key\n                value\n                reference {\n                  ... on MediaImage {\n                    image {\n                      url\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n    announcementBarMetaobject: metaobject(handle: {handle: "announcement-bar-1", type: "announcement_bar"}) {\n      ...AnnouncementBarMetaobject\n    }\n    announcementBarMetaobjects: metaobjects(type: "announcement_bar", first: 10) {\n      nodes {\n        ...AnnouncementBarMetaobject\n      }\n    }\n  }\n  #graphql\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    tags\n    title\n    type\n    url\n  }\n  fragment GrandchildMenuItem on MenuItem {\n    ...MenuItem\n  }\n  fragment ChildMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...GrandchildMenuItem\n    }\n  }\n  fragment ParentMenuItem on MenuItem {\n    ...MenuItem\n    # Mega menu picture: the collection\'s own image, else its best seller.\n    resource {\n      ... on Collection {\n        image {\n          url\n          altText\n          width\n          height\n        }\n        products(first: 1, sortKey: BEST_SELLING) {\n          nodes {\n            featuredImage {\n              url\n              altText\n              width\n              height\n            }\n          }\n        }\n      }\n    }\n    items {\n      ...ChildMenuItem\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...ParentMenuItem\n    }\n  }\n\n': {
    return: HeaderQuery;
    variables: HeaderQueryVariables;
  };
  '#graphql\n  fragment FooterMenu on Menu {\n    id\n    title\n    items {\n      id\n      title\n      url\n    }\n  }\n  query Footer($country: CountryCode, $language: LanguageCode)\n  @inContext(language: $language, country: $country) {\n    women: menu(handle: "footer-women") {\n      ...FooterMenu\n    }\n    men: menu(handle: "footer-men") {\n      ...FooterMenu\n    }\n    kids: menu(handle: "footer-kids") {\n      ...FooterMenu\n    }\n    beauty: menu(handle: "footer-beauty") {\n      ...FooterMenu\n    }\n    footwear: menu(handle: "footer-footwear") {\n      ...FooterMenu\n    }\n    bags: menu(handle: "footer-bags") {\n      ...FooterMenu\n    }\n    homeLiving: menu(handle: "footer-home-living") {\n      ...FooterMenu\n    }\n    babyshop: menu(handle: "footer-babyshop") {\n      ...FooterMenu\n    }\n    more: menu(handle: "more") {\n      ...FooterMenu\n    }\n    help: menu(handle: "help") {\n      ...FooterMenu\n    }\n    footerMain: metaobject(handle: {type: "footer_main", handle: "footer-menu"}) {\n      contacts: field(key: "footer_contacts") {\n        references(first: 10) {\n          nodes {\n            ... on Metaobject {\n              id\n              handle\n              name: field(key: "name") {\n                value\n              }\n              contact: field(key: "contact") {\n                value\n              }\n              sortOrder: field(key: "sort_order") {\n                value\n              }\n            }\n          }\n        }\n      }\n      copyright: field(key: "footer_copyright") {\n        reference {\n          ... on Metaobject {\n            text: field(key: "copyright_text") {\n              value\n            }\n            logo: field(key: "logo") {\n              reference {\n                ... on MediaImage {\n                  image {\n                    url\n                    altText\n                    width\n                    height\n                  }\n                }\n              }\n            }\n            links: field(key: "footer_links") {\n              references(first: 10) {\n                nodes {\n                  ... on Metaobject {\n                    id\n                    handle\n                    text: field(key: "text") {\n                      value\n                    }\n                    sortOrder: field(key: "sort_order") {\n                      value\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n    headerLogo: metaobjects(type: "main_header", first: 1) {\n      nodes {\n        logo: field(key: "logo") {\n          reference {\n            ... on MediaImage {\n              image {\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n        }\n      }\n    }\n    shop {\n      name\n      privacyPolicy {\n        handle\n        title\n      }\n      refundPolicy {\n        handle\n        title\n      }\n      shippingPolicy {\n        handle\n        title\n      }\n      termsOfService {\n        handle\n        title\n      }\n    }\n  }\n': {
    return: FooterQuery;
    variables: FooterQueryVariables;
  };
  '#graphql\n  query HomeSections($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    sections: metaobjects(type: "home_page", first: 20) {\n      nodes {\n        id\n        handle\n        heading: field(key: "heading") {\n          reference {\n            ... on Metaobject {\n              title: field(key: "heading") {\n                value\n              }\n            }\n          }\n        }\n        order: field(key: "sort_order") {\n          value\n        }\n        hidden: field(key: "hidden") {\n          value\n        }\n        mobileBanner: field(key: "mobile_banner") {\n          reference {\n            ... on Metaobject {\n              id\n            }\n          }\n        }\n        data: field(key: "section_data") {\n          references(first: 50) {\n            nodes {\n              ... on Metaobject {\n                id\n                type\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: HomeSectionsQuery;
    variables: HomeSectionsQueryVariables;
  };
  '#graphql\n  fragment HomeImage on MediaImage {\n    image {\n      url\n      altText\n      width\n      height\n    }\n  }\n  fragment HomeLeaf on Metaobject {\n    id\n    type\n    handle\n    fields {\n      key\n      type\n      value\n      reference {\n        __typename\n        ...HomeImage\n        ... on Collection {\n          handle\n        }\n      }\n    }\n  }\n  query HomeNodes($ids: [ID!]!, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    nodes(ids: $ids) {\n      __typename\n      ... on Metaobject {\n        id\n        type\n        handle\n        fields {\n          key\n          type\n          value\n          reference {\n            __typename\n            ...HomeImage\n            ... on Collection {\n              handle\n            }\n            ...HomeLeaf\n          }\n          references(first: 50) {\n            nodes {\n              __typename\n              ...HomeLeaf\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: HomeNodesQuery;
    variables: HomeNodesQueryVariables;
  };
  '#graphql\n    query MainHeaderMetaobject {\n      metaobject(handle: {type: "main_header", handle: "main-header-azyeqhek"}) {\n        fields {\n          key\n          value\n          reference {\n            ... on Metaobject {\n              fields {\n                key\n                value\n              }\n            }\n            ... on MediaImage {\n              image {\n                url\n              }\n            }\n          }\n        }\n      }\n    }\n  ': {
    return: MainHeaderMetaobjectQuery;
    variables: MainHeaderMetaobjectQueryVariables;
  };
  '#graphql\n  query Article(\n    $articleHandle: String!\n    $blogHandle: String!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    blog(handle: $blogHandle) {\n      handle\n      articleByHandle(handle: $articleHandle) {\n        handle\n        title\n        contentHtml\n        publishedAt\n        author: authorV2 {\n          name\n        }\n        image {\n          id\n          altText\n          url\n          width\n          height\n        }\n        seo {\n          description\n          title\n        }\n      }\n    }\n  }\n': {
    return: ArticleQuery;
    variables: ArticleQueryVariables;
  };
  '#graphql\n  query Blog(\n    $language: LanguageCode\n    $blogHandle: String!\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(language: $language) {\n    blog(handle: $blogHandle) {\n      title\n      handle\n      seo {\n        title\n        description\n      }\n      articles(\n        first: $first,\n        last: $last,\n        before: $startCursor,\n        after: $endCursor\n      ) {\n        nodes {\n          ...ArticleItem\n        }\n        pageInfo {\n          hasPreviousPage\n          hasNextPage\n          hasNextPage\n          endCursor\n          startCursor\n        }\n\n      }\n    }\n  }\n  fragment ArticleItem on Article {\n    author: authorV2 {\n      name\n    }\n    contentHtml\n    handle\n    id\n    image {\n      id\n      altText\n      url\n      width\n      height\n    }\n    publishedAt\n    title\n    blog {\n      handle\n    }\n  }\n': {
    return: BlogQuery;
    variables: BlogQueryVariables;
  };
  '#graphql\n  query Blogs(\n    $country: CountryCode\n    $endCursor: String\n    $first: Int\n    $language: LanguageCode\n    $last: Int\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    blogs(\n      first: $first,\n      last: $last,\n      before: $startCursor,\n      after: $endCursor\n    ) {\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      nodes {\n        title\n        handle\n        seo {\n          title\n          description\n        }\n      }\n    }\n  }\n': {
    return: BlogsQuery;
    variables: BlogsQueryVariables;
  };
  '#graphql\n  #graphql\n  fragment ProductCard on Product {\n    id\n    handle\n    title\n    vendor\n    publishedAt\n    availableForSale\n    tags\n    images(first: 2) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    rating: metafield(namespace: "reviews", key: "rating") {\n      value\n    }\n    ratingCount: metafield(namespace: "reviews", key: "rating_count") {\n      value\n    }\n  }\n\n  query EmptyCollectionFallback($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    products(first: 8, sortKey: BEST_SELLING) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n': {
    return: EmptyCollectionFallbackQuery;
    variables: EmptyCollectionFallbackQueryVariables;
  };
  '#graphql\n  #graphql\n  fragment ProductCard on Product {\n    id\n    handle\n    title\n    vendor\n    publishedAt\n    availableForSale\n    tags\n    images(first: 2) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    rating: metafield(namespace: "reviews", key: "rating") {\n      value\n    }\n    ratingCount: metafield(namespace: "reviews", key: "rating_count") {\n      value\n    }\n  }\n\n  query CollectionPlp(\n    $handle: String!\n    $filters: [ProductFilter!]\n    $sortKey: ProductCollectionSortKeys\n    $reverse: Boolean\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      id\n      handle\n      title\n      description\n      descriptionHtml\n      seo {\n        title\n        description\n      }\n      faq: metafield(namespace: "custom", key: "faq") {\n        value\n      }\n      products(\n        first: $first\n        last: $last\n        before: $startCursor\n        after: $endCursor\n        filters: $filters\n        sortKey: $sortKey\n        reverse: $reverse\n      ) {\n        filters {\n          id\n          label\n          type\n          values {\n            id\n            label\n            count\n            input\n          }\n        }\n        nodes {\n          ...ProductCard\n        }\n        pageInfo {\n          hasPreviousPage\n          hasNextPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n': {
    return: CollectionPlpQuery;
    variables: CollectionPlpQueryVariables;
  };
  '#graphql\n  query PopularSearches($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    menu(handle: "popular-searches") {\n      items {\n        title\n        url\n      }\n    }\n  }\n': {
    return: PopularSearchesQuery;
    variables: PopularSearchesQueryVariables;
  };
  '#graphql\n  fragment Collection on Collection {\n    id\n    title\n    handle\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n  }\n  query StoreCollections(\n    $country: CountryCode\n    $endCursor: String\n    $first: Int\n    $language: LanguageCode\n    $last: Int\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    collections(\n      first: $first,\n      last: $last,\n      before: $startCursor,\n      after: $endCursor\n    ) {\n      nodes {\n        ...Collection\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n': {
    return: StoreCollectionsQuery;
    variables: StoreCollectionsQueryVariables;
  };
  '#graphql\n  #graphql\n  fragment ProductCard on Product {\n    id\n    handle\n    title\n    vendor\n    publishedAt\n    availableForSale\n    tags\n    images(first: 2) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    rating: metafield(namespace: "reviews", key: "rating") {\n      value\n    }\n    ratingCount: metafield(namespace: "reviews", key: "rating_count") {\n      value\n    }\n  }\n\n  query Catalog(\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(country: $country, language: $language) {\n    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {\n      nodes {\n        ...ProductCard\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n': {
    return: CatalogQuery;
    variables: CatalogQueryVariables;
  };
  '#graphql\n  query Page(\n    $language: LanguageCode,\n    $country: CountryCode,\n    $handle: String!\n  )\n  @inContext(language: $language, country: $country) {\n    page(handle: $handle) {\n      handle\n      id\n      title\n      body\n      seo {\n        description\n        title\n      }\n    }\n  }\n': {
    return: PageQuery;
    variables: PageQueryVariables;
  };
  '#graphql\n  query ContactPage($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    page(handle: "contact") {\n      body\n    }\n    footer: metaobject(handle: {type: "footer_main", handle: "footer-menu"}) {\n      contacts: field(key: "footer_contacts") {\n        references(first: 10) {\n          nodes {\n            ... on Metaobject {\n              id\n              name: field(key: "name") {\n                value\n              }\n              contact: field(key: "contact") {\n                value\n              }\n              sortOrder: field(key: "sort_order") {\n                value\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: ContactPageQuery;
    variables: ContactPageQueryVariables;
  };
  '#graphql\n  fragment Policy on ShopPolicy {\n    body\n    handle\n    id\n    title\n    url\n  }\n  query Policy(\n    $country: CountryCode\n    $language: LanguageCode\n    $privacyPolicy: Boolean!\n    $refundPolicy: Boolean!\n    $shippingPolicy: Boolean!\n    $termsOfService: Boolean!\n  ) @inContext(language: $language, country: $country) {\n    shop {\n      privacyPolicy @include(if: $privacyPolicy) {\n        ...Policy\n      }\n      shippingPolicy @include(if: $shippingPolicy) {\n        ...Policy\n      }\n      termsOfService @include(if: $termsOfService) {\n        ...Policy\n      }\n      refundPolicy @include(if: $refundPolicy) {\n        ...Policy\n      }\n    }\n  }\n': {
    return: PolicyQuery;
    variables: PolicyQueryVariables;
  };
  '#graphql\n  fragment PolicyItem on ShopPolicy {\n    id\n    title\n    handle\n  }\n  query Policies ($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    shop {\n      privacyPolicy {\n        ...PolicyItem\n      }\n      shippingPolicy {\n        ...PolicyItem\n      }\n      termsOfService {\n        ...PolicyItem\n      }\n      refundPolicy {\n        ...PolicyItem\n      }\n      subscriptionPolicy {\n        id\n        title\n        handle\n      }\n    }\n  }\n': {
    return: PoliciesQuery;
    variables: PoliciesQueryVariables;
  };
  '#graphql\n  query Product(\n    $country: CountryCode\n    $handle: String!\n    $language: LanguageCode\n    $selectedOptions: [SelectedOptionInput!]!\n    $specs: [HasMetafieldsIdentifier!]!\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      ...Product\n    }\n  }\n  #graphql\n  fragment Product on Product {\n    id\n    title\n    vendor\n    handle\n    descriptionHtml\n    description\n    encodedVariantExistence\n    encodedVariantAvailability\n    images(first: 12) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    collections(first: 10) {\n      nodes {\n        handle\n        title\n      }\n    }\n    options {\n      name\n      optionValues {\n        name\n        firstSelectableVariant {\n          ...ProductVariant\n        }\n        swatch {\n          color\n          image {\n            previewImage {\n              url\n            }\n          }\n        }\n      }\n    }\n    selectedOrFirstAvailableVariant(\n      selectedOptions: $selectedOptions\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      ...ProductVariant\n    }\n    adjacentVariants(selectedOptions: $selectedOptions) {\n      ...ProductVariant\n    }\n    specs: metafields(identifiers: $specs) {\n      key\n      value\n    }\n    sizeChart: metafield(namespace: "custom", key: "size_chart") {\n      reference {\n        __typename\n        ... on MediaImage {\n          image {\n            url\n          }\n        }\n      }\n    }\n    rating: metafield(namespace: "reviews", key: "rating") {\n      value\n    }\n    ratingCount: metafield(namespace: "reviews", key: "rating_count") {\n      value\n    }\n    seo {\n      description\n      title\n    }\n  }\n  #graphql\n  fragment ProductVariant on ProductVariant {\n    availableForSale\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    id\n    image {\n      __typename\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    product {\n      title\n      handle\n    }\n    selectedOptions {\n      name\n      value\n    }\n    sku\n    title\n    unitPrice {\n      amount\n      currencyCode\n    }\n  }\n\n\n': {
    return: ProductQuery;
    variables: ProductQueryVariables;
  };
  '#graphql\n  #graphql\n  fragment ProductCard on Product {\n    id\n    handle\n    title\n    vendor\n    publishedAt\n    availableForSale\n    tags\n    images(first: 2) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    rating: metafield(namespace: "reviews", key: "rating") {\n      value\n    }\n    ratingCount: metafield(namespace: "reviews", key: "rating_count") {\n      value\n    }\n  }\n\n  query ProductRecommendations(\n    $productId: ID!\n    $intent: ProductRecommendationIntent\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    productRecommendations(productId: $productId, intent: $intent) {\n      ...ProductCard\n    }\n  }\n': {
    return: ProductRecommendationsQuery;
    variables: ProductRecommendationsQueryVariables;
  };
  '#graphql\n  query ProductStock($handle: String!, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      variants(first: 100) {\n        nodes {\n          id\n          quantityAvailable\n        }\n      }\n    }\n  }\n': {
    return: ProductStockQuery;
    variables: ProductStockQueryVariables;
  };
  '#graphql\n  #graphql\n  fragment ProductCard on Product {\n    id\n    handle\n    title\n    vendor\n    publishedAt\n    availableForSale\n    tags\n    images(first: 2) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    rating: metafield(namespace: "reviews", key: "rating") {\n      value\n    }\n    ratingCount: metafield(namespace: "reviews", key: "rating_count") {\n      value\n    }\n  }\n\n  query SearchProducts(\n    $term: String!\n    $filters: [ProductFilter!]\n    $sortKey: SearchSortKeys\n    $reverse: Boolean\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    products: search(\n      query: $term\n      types: [PRODUCT]\n      productFilters: $filters\n      sortKey: $sortKey\n      reverse: $reverse\n      first: $first\n      last: $last\n      before: $startCursor\n      after: $endCursor\n      unavailableProducts: LAST\n    ) {\n      totalCount\n      productFilters {\n        id\n        label\n        type\n        values {\n          id\n          label\n          count\n          input\n        }\n      }\n      nodes {\n        ... on Product {\n          ...ProductCard\n        }\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n': {
    return: SearchProductsQuery;
    variables: SearchProductsQueryVariables;
  };
  '#graphql\n  query PredictiveSearch(\n    $country: CountryCode\n    $language: LanguageCode\n    $limit: Int!\n    $limitScope: PredictiveSearchLimitScope!\n    $term: String!\n    $types: [PredictiveSearchType!]\n  ) @inContext(country: $country, language: $language) {\n    predictiveSearch(\n      limit: $limit,\n      limitScope: $limitScope,\n      query: $term,\n      types: $types,\n    ) {\n      articles {\n        ...PredictiveArticle\n      }\n      collections {\n        ...PredictiveCollection\n      }\n      pages {\n        ...PredictivePage\n      }\n      products {\n        ...PredictiveProduct\n      }\n      queries {\n        ...PredictiveQuery\n      }\n    }\n  }\n  #graphql\n  fragment PredictiveArticle on Article {\n    __typename\n    id\n    title\n    handle\n    blog {\n      handle\n    }\n    image {\n      url\n      altText\n      width\n      height\n    }\n    trackingParameters\n  }\n\n  #graphql\n  fragment PredictiveCollection on Collection {\n    __typename\n    id\n    title\n    handle\n    image {\n      url\n      altText\n      width\n      height\n    }\n    trackingParameters\n  }\n\n  #graphql\n  fragment PredictivePage on Page {\n    __typename\n    id\n    title\n    handle\n    trackingParameters\n  }\n\n  #graphql\n  fragment PredictiveProduct on Product {\n    __typename\n    id\n    title\n    handle\n    trackingParameters\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      id\n      image {\n        url\n        altText\n        width\n        height\n      }\n      price {\n        amount\n        currencyCode\n      }\n    }\n  }\n\n  #graphql\n  fragment PredictiveQuery on SearchQuerySuggestion {\n    __typename\n    text\n    styledText\n    trackingParameters\n  }\n\n': {
    return: PredictiveSearchQuery;
    variables: PredictiveSearchQueryVariables;
  };
}

interface GeneratedMutationTypes {
  '#graphql\n  mutation NewsletterSubscribe($input: CustomerCreateInput!) {\n    customerCreate(input: $input) {\n      customer {\n        id\n      }\n      customerUserErrors {\n        code\n        message\n      }\n    }\n  }\n': {
    return: NewsletterSubscribeMutation;
    variables: NewsletterSubscribeMutationVariables;
  };
}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
